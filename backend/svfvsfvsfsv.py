from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import hashlib
import jwt
import os
from enum import Enum
import shutil

# FastAPI App
app = FastAPI(title="VIDYARTHI MITRAA API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# MongoDB Connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "vidyarthi_mitraa"
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# JWT Settings
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
security = HTTPBearer()

# Upload Directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper Functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_jwt_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = verify_jwt_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return user_id

def serialize_object(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {key: serialize_object(value) for key, value in obj.items()}
    if isinstance(obj, list):
        return [serialize_object(item) for item in obj]
    return obj

# Pydantic Models
class UserRegistration(BaseModel):
    name: str
    email: EmailStr
    password: str
    contact_no: str
    gender: str
    dob: str
    education: str
    course: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class InstitutionCreate(BaseModel):
    name: str
    description: str
    vision: Optional[str] = None
    mission: Optional[str] = None

class TestimonialCreate(BaseModel):
    title: str
    description: str
    student_name: str
    course: str
    rating: int = 5
    media_type: str

class CourseCreate(BaseModel):
    name: str
    title: str
    description: str
    category: str
    sub_category: str
    start_date: str
    end_date: str
    duration: str
    instructor: str
    price: float = 0

class MaterialCreate(BaseModel):
    class_name: str
    course: str
    subject: str
    module: str
    title: str
    description: str
    academic_year: str
    time_period: int
    price: float = 0

class OnlineTestCreate(BaseModel):
    class_name: str
    course: str
    subject: str
    module: str
    test_title: str
    description: str
    total_questions: int
    total_marks: int
    duration: int
    difficulty_level: str
    time_period: int
    pass_mark: int

class TestQuestionCreate(BaseModel):
    test_id: str
    question_number: int
    question: str
    options: List[Dict[str, Any]]
    correct_answer: str
    explanation: Optional[str] = None
    marks: int = 1

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str
    target_audience: str = "all"

class CurrentAffairsCreate(BaseModel):
    title: str
    content: str
    category: str
    publish_date: str
    importance: str = "Medium"

# File Upload Helper
async def save_file(file: UploadFile, folder: str) -> str:
    file_path = os.path.join(UPLOAD_DIR, folder, file.filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file_path

# =============== USER AUTHENTICATION ROUTES ===============

@app.post("/auth/register")
async def register_user(user_data: UserRegistration):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = {
        **user_data.dict(),
        "password": hash_password(user_data.password),
        "dob": datetime.fromisoformat(user_data.dob.replace('Z', '+00:00')),
        "is_active": True,
        "last_login": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    token = create_jwt_token(str(result.inserted_id))
    
    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
        "token": token
    }

@app.post("/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or user["password"] != hash_password(login_data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    token = create_jwt_token(str(user["_id"]))
    return {
        "message": "Login successful",
        "user_id": str(user["_id"]),
        "token": token,
        "user": serialize_object(user)
    }

# =============== USER ROUTES ===============

@app.get("/users")
async def get_all_users():
    users = []
    async for user in db.users.find():
        users.append(serialize_object(user))
    return {"users": users}

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": serialize_object(user)}

@app.put("/users/{user_id}")
async def update_user(user_id: str, user_data: dict):
    user_data["updated_at"] = datetime.utcnow()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": user_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated successfully"}

@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# =============== INSTITUTION ROUTES ===============

@app.post("/institutions")
async def create_institution(institution: InstitutionCreate):
    institution_dict = {
        **institution.dict(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.institutions.insert_one(institution_dict)
    return {"message": "Institution created", "id": str(result.inserted_id)}

@app.get("/institutions")
async def get_institutions():
    institutions = []
    async for inst in db.institutions.find():
        institutions.append(serialize_object(inst))
    return {"institutions": institutions}

@app.get("/institutions/{institution_id}")
async def get_institution(institution_id: str):
    institution = await db.institutions.find_one({"_id": ObjectId(institution_id)})
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    return {"institution": serialize_object(institution)}

@app.put("/institutions/{institution_id}")
async def update_institution(institution_id: str, institution_data: dict):
    institution_data["updated_at"] = datetime.utcnow()
    result = await db.institutions.update_one(
        {"_id": ObjectId(institution_id)},
        {"$set": institution_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Institution not found")
    return {"message": "Institution updated successfully"}

@app.delete("/institutions/{institution_id}")
async def delete_institution(institution_id: str):
    result = await db.institutions.delete_one({"_id": ObjectId(institution_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Institution not found")
    return {"message": "Institution deleted successfully"}

# =============== TESTIMONIAL ROUTES ===============

@app.post("/testimonials")
async def create_testimonial(
    testimonial: TestimonialCreate,
    media_file: UploadFile = File(...),
    student_image: Optional[UploadFile] = File(None)
):
    media_url = await save_file(media_file, "testimonials")
    student_image_url = None
    if student_image:
        student_image_url = await save_file(student_image, "students")
    
    testimonial_dict = {
        **testimonial.dict(),
        "media_url": media_url,
        "student_image": student_image_url,
        "is_active": True,
        "is_featured": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.testimonials.insert_one(testimonial_dict)
    return {"message": "Testimonial created", "id": str(result.inserted_id)}

@app.get("/testimonials")
async def get_testimonials():
    testimonials = []
    async for test in db.testimonials.find():
        testimonials.append(serialize_object(test))
    return {"testimonials": testimonials}

@app.get("/testimonials/{testimonial_id}")
async def get_testimonial(testimonial_id: str):
    testimonial = await db.testimonials.find_one({"_id": ObjectId(testimonial_id)})
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"testimonial": serialize_object(testimonial)}

@app.put("/testimonials/{testimonial_id}")
async def update_testimonial(testimonial_id: str, testimonial_data: dict):
    testimonial_data["updated_at"] = datetime.utcnow()
    result = await db.testimonials.update_one(
        {"_id": ObjectId(testimonial_id)},
        {"$set": testimonial_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial updated successfully"}

@app.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str):
    result = await db.testimonials.delete_one({"_id": ObjectId(testimonial_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted successfully"}

# =============== COURSE ROUTES ===============

@app.post("/courses")
async def create_course(
    course: CourseCreate,
    thumbnail: UploadFile = File(...)
):
    thumbnail_url = await save_file(thumbnail, "courses")
    
    course_dict = {
        **course.dict(),
        "thumbnail_image": thumbnail_url,
        "start_date": datetime.fromisoformat(course.start_date.replace('Z', '+00:00')),
        "end_date": datetime.fromisoformat(course.end_date.replace('Z', '+00:00')),
        "enrolled_students": 0,
        "status": "active",
        "is_featured": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.courses.insert_one(course_dict)
    return {"message": "Course created", "id": str(result.inserted_id)}

@app.get("/courses")
async def get_courses():
    courses = []
    async for course in db.courses.find():
        courses.append(serialize_object(course))
    return {"courses": courses}

@app.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"course": serialize_object(course)}

@app.put("/courses/{course_id}")
async def update_course(course_id: str, course_data: dict):
    course_data["updated_at"] = datetime.utcnow()
    result = await db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {"$set": course_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course updated successfully"}

@app.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    result = await db.courses.delete_one({"_id": ObjectId(course_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# =============== MATERIAL ROUTES ===============

@app.post("/materials")
async def create_material(
    material: MaterialCreate,
    pdf_file: UploadFile = File(...)
):
    file_url = await save_file(pdf_file, "materials")
    
    material_dict = {
        **material.dict(),
        "file_url": file_url,
        "file_size": pdf_file.size,
        "download_count": 0,
        "tags": [],
        "feedback": [],
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.materials.insert_one(material_dict)
    return {"message": "Material created", "id": str(result.inserted_id)}

@app.get("/materials")
async def get_materials():
    materials = []
    async for material in db.materials.find():
        materials.append(serialize_object(material))
    return {"materials": materials}

@app.get("/materials/{material_id}")
async def get_material(material_id: str):
    material = await db.materials.find_one({"_id": ObjectId(material_id)})
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Increment view/access count
    await db.materials.update_one(
        {"_id": ObjectId(material_id)},
        {"$inc": {"download_count": 1}}
    )
    
    return {"material": serialize_object(material)}

@app.put("/materials/{material_id}")
async def update_material(material_id: str, material_data: dict):
    material_data["updated_at"] = datetime.utcnow()
    result = await db.materials.update_one(
        {"_id": ObjectId(material_id)},
        {"$set": material_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material updated successfully"}

@app.delete("/materials/{material_id}")
async def delete_material(material_id: str):
    result = await db.materials.delete_one({"_id": ObjectId(material_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted successfully"}

# =============== ONLINE TEST ROUTES ===============

@app.post("/tests")
async def create_test(test: OnlineTestCreate):
    test_dict = {
        **test.dict(),
        "date_published": datetime.utcnow(),
        "result_type": "Instant",
        "answer_key": True,
        "tags": [],
        "attempts_count": 1,
        "feedback": [],
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.online_tests.insert_one(test_dict)
    return {"message": "Test created", "id": str(result.inserted_id)}

@app.get("/tests")
async def get_tests():
    tests = []
    async for test in db.online_tests.find():
        tests.append(serialize_object(test))
    return {"tests": tests}

@app.get("/tests/{test_id}")
async def get_test(test_id: str):
    test = await db.online_tests.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"test": serialize_object(test)}

@app.put("/tests/{test_id}")
async def update_test(test_id: str, test_data: dict):
    test_data["updated_at"] = datetime.utcnow()
    result = await db.online_tests.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": test_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test updated successfully"}

@app.delete("/tests/{test_id}")
async def delete_test(test_id: str):
    result = await db.online_tests.delete_one({"_id": ObjectId(test_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test deleted successfully"}

# =============== TEST QUESTION ROUTES ===============

@app.post("/test-questions")
async def create_question(question: TestQuestionCreate):
    question_dict = {
        **question.dict(),
        "test_id": ObjectId(question.test_id),
        "difficulty_level": "Medium",
        "tags": [],
        "created_at": datetime.utcnow()
    }
    
    result = await db.test_questions.insert_one(question_dict)
    return {"message": "Question created", "id": str(result.inserted_id)}

@app.get("/test-questions/test/{test_id}")
async def get_test_questions(test_id: str):
    questions = []
    async for question in db.test_questions.find({"test_id": ObjectId(test_id)}):
        questions.append(serialize_object(question))
    return {"questions": questions}

@app.get("/test-questions/{question_id}")
async def get_question(question_id: str):
    question = await db.test_questions.find_one({"_id": ObjectId(question_id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"question": serialize_object(question)}

@app.put("/test-questions/{question_id}")
async def update_question(question_id: str, question_data: dict):
    result = await db.test_questions.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": question_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question updated successfully"}

@app.delete("/test-questions/{question_id}")
async def delete_question(question_id: str):
    result = await db.test_questions.delete_one({"_id": ObjectId(question_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}

# =============== USER TEST ATTEMPT ROUTES ===============

@app.post("/test-attempts")
async def start_test_attempt(test_id: str, user_id: str = Depends(get_current_user)):
    # Check if test exists
    test = await db.online_tests.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Create attempt
    attempt_dict = {
        "user_id": ObjectId(user_id),
        "test_id": ObjectId(test_id),
        "attempt_number": 1,
        "start_time": datetime.utcnow(),
        "answers": [],
        "total_marks_obtained": 0,
        "percentage": 0,
        "result": "Pending",
        "status": "in-progress",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.user_test_attempts.insert_one(attempt_dict)
    return {"message": "Test attempt started", "attempt_id": str(result.inserted_id)}

@app.put("/test-attempts/{attempt_id}/answer")
async def submit_answer(attempt_id: str, answer_data: dict):
    result = await db.user_test_attempts.update_one(
        {"_id": ObjectId(attempt_id)},
        {
            "$push": {"answers": answer_data},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return {"message": "Answer submitted"}

@app.put("/test-attempts/{attempt_id}/complete")
async def complete_test_attempt(attempt_id: str):
    attempt_dict = {
        "end_time": datetime.utcnow(),
        "status": "completed",
        "updated_at": datetime.utcnow()
    }
    
    result = await db.user_test_attempts.update_one(
        {"_id": ObjectId(attempt_id)},
        {"$set": attempt_dict}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return {"message": "Test completed"}

@app.get("/test-attempts/user/{user_id}")
async def get_user_test_attempts(user_id: str):
    attempts = []
    async for attempt in db.user_test_attempts.find({"user_id": ObjectId(user_id)}):
        attempts.append(serialize_object(attempt))
    return {"attempts": attempts}

@app.get("/test-attempts/{attempt_id}")
async def get_test_attempt(attempt_id: str):
    attempt = await db.user_test_attempts.find_one({"_id": ObjectId(attempt_id)})
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return {"attempt": serialize_object(attempt)}

# =============== NOTIFICATION ROUTES ===============

@app.post("/notifications")
async def create_notification(notification: NotificationCreate):
    notification_dict = {
        **notification.dict(),
        "priority": "medium",
        "is_active": True,
        "read_by": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.notifications.insert_one(notification_dict)
    return {"message": "Notification created", "id": str(result.inserted_id)}

@app.get("/notifications")
async def get_notifications():
    notifications = []
    async for notif in db.notifications.find():
        notifications.append(serialize_object(notif))
    return {"notifications": notifications}

@app.get("/notifications/{notification_id}")
async def get_notification(notification_id: str):
    notification = await db.notifications.find_one({"_id": ObjectId(notification_id)})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"notification": serialize_object(notification)}

@app.put("/notifications/{notification_id}")
async def update_notification(notification_id: str, notification_data: dict):
    notification_data["updated_at"] = datetime.utcnow()
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": notification_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification updated successfully"}

@app.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str):
    result = await db.notifications.delete_one({"_id": ObjectId(notification_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}

# =============== CURRENT AFFAIRS ROUTES ===============

@app.post("/current-affairs")
async def create_current_affairs(affairs: CurrentAffairsCreate):
    affairs_dict = {
        **affairs.dict(),
        "publish_date": datetime.fromisoformat(affairs.publish_date.replace('Z', '+00:00')),
        "tags": [],
        "view_count": 0,
        "likes": 0,
        "is_active": True,
        "is_featured": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.current_affairs.insert_one(affairs_dict)
    return {"message": "Current affairs created", "id": str(result.inserted_id)}

@app.get("/current-affairs")
async def get_current_affairs():
    affairs = []
    async for affair in db.current_affairs.find():
        affairs.append(serialize_object(affair))
    return {"current_affairs": affairs}

@app.get("/current-affairs/{affairs_id}")
async def get_current_affair(affairs_id: str):
    affair = await db.current_affairs.find_one({"_id": ObjectId(affairs_id)})
    if not affair:
        raise HTTPException(status_code=404, detail="Current affairs not found")
    
    # Increment view count
    await db.current_affairs.update_one(
        {"_id": ObjectId(affairs_id)},
        {"$inc": {"view_count": 1}}
    )
    
    return {"current_affairs": serialize_object(affair)}

@app.put("/current-affairs/{affairs_id}")
async def update_current_affairs(affairs_id: str, affairs_data: dict):
    affairs_data["updated_at"] = datetime.utcnow()
    result = await db.current_affairs.update_one(
        {"_id": ObjectId(affairs_id)},
        {"$set": affairs_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Current affairs not found")
    return {"message": "Current affairs updated successfully"}

@app.delete("/current-affairs/{affairs_id}")
async def delete_current_affairs(affairs_id: str):
    result = await db.current_affairs.delete_one({"_id": ObjectId(affairs_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Current affairs not found")
    return {"message": "Current affairs deleted successfully"}

# =============== CONTACT ROUTES ===============

@app.post("/contact")
async def create_contact(contact_data: dict):
    contact_dict = {
        **contact_data,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.contacts.insert_one(contact_dict)
    return {"message": "Contact info created", "id": str(result.inserted_id)}

@app.get("/contact")
async def get_contact():
    contact = await db.contacts.find_one({"is_active": True})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact info not found")
    return {"contact": serialize_object(contact)}

@app.put("/contact/{contact_id}")
async def update_contact(contact_id: str, contact_data: dict):
    contact_data["updated_at"] = datetime.utcnow()
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": contact_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact updated successfully"}

# =============== USER CONTACT MESSAGES ROUTES ===============

@app.post("/contact-messages")
async def create_contact_message(message_data: dict):
    message_dict = {
        **message_data,
        "status": "pending",
        "priority": "medium",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.user_contact_messages.insert_one(message_dict)
    return {"message": "Contact message sent", "id": str(result.inserted_id)}

@app.get("/contact-messages")
async def get_contact_messages():
    messages = []
    async for message in db.user_contact_messages.find():
        messages.append(serialize_object(message))
    return {"messages": messages}

@app.get("/contact-messages/{message_id}")
async def get_contact_message(message_id: str):
    message = await db.user_contact_messages.find_one({"_id": ObjectId(message_id)})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": serialize_object(message)}

@app.put("/contact-messages/{message_id}")
async def update_contact_message(message_id: str, message_data: dict):
    message_data["updated_at"] = datetime.utcnow()
    result = await db.user_contact_messages.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": message_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Contact message updated successfully"}

@app.delete("/contact-messages/{message_id}")
async def delete_contact_message(message_id: str):
    result = await db.user_contact_messages.delete_one({"_id": ObjectId(message_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Contact message deleted successfully"}

# =============== TERMS AND CONDITIONS ROUTES ===============

@app.post("/terms-conditions")
async def create_terms_conditions(terms_data: dict):
    terms_dict = {
        **terms_data,
        "effective_date": datetime.fromisoformat(terms_data.get("effective_date", datetime.utcnow().isoformat()).replace('Z', '+00:00')),
        "last_modified": datetime.utcnow(),
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.terms_conditions.insert_one(terms_dict)
    return {"message": "Terms and conditions created", "id": str(result.inserted_id)}

@app.get("/terms-conditions")
async def get_terms_conditions():
    terms = await db.terms_conditions.find_one({"is_active": True})
    if not terms:
        raise HTTPException(status_code=404, detail="Terms and conditions not found")
    return {"terms": serialize_object(terms)}

@app.get("/terms-conditions/{terms_id}")
async def get_terms_by_id(terms_id: str):
    terms = await db.terms_conditions.find_one({"_id": ObjectId(terms_id)})
    if not terms:
        raise HTTPException(status_code=404, detail="Terms and conditions not found")
    return {"terms": serialize_object(terms)}

@app.put("/terms-conditions/{terms_id}")
async def update_terms_conditions(terms_id: str, terms_data: dict):
    terms_data["last_modified"] = datetime.utcnow()
    terms_data["updated_at"] = datetime.utcnow()
    result = await db.terms_conditions.update_one(
        {"_id": ObjectId(terms_id)},
        {"$set": terms_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Terms and conditions not found")
    return {"message": "Terms and conditions updated successfully"}

@app.delete("/terms-conditions/{terms_id}")
async def delete_terms_conditions(terms_id: str):
    result = await db.terms_conditions.delete_one({"_id": ObjectId(terms_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Terms and conditions not found")
    return {"message": "Terms and conditions deleted successfully"}

# =============== USER DOWNLOAD TRACKING ROUTES ===============

@app.post("/downloads")
async def track_download(download_data: dict, user_id: str = Depends(get_current_user)):
    # Check if user already downloaded this material
    existing_download = await db.user_downloads.find_one({
        "user_id": ObjectId(user_id),
        "material_id": ObjectId(download_data["material_id"])
    })
    
    if existing_download:
        # Update download count
        await db.user_downloads.update_one(
            {"_id": existing_download["_id"]},
            {
                "$inc": {"download_count": 1},
                "$set": {"last_download_at": datetime.utcnow()}
            }
        )
    else:
        # Create new download record
        download_dict = {
            "user_id": ObjectId(user_id),
            "material_id": ObjectId(download_data["material_id"]),
            "download_count": 1,
            "last_download_at": datetime.utcnow(),
            "ip_address": download_data.get("ip_address"),
            "user_agent": download_data.get("user_agent"),
            "created_at": datetime.utcnow()
        }
        await db.user_downloads.insert_one(download_dict)
    
    # Update material download count
    await db.materials.update_one(
        {"_id": ObjectId(download_data["material_id"])},
        {"$inc": {"download_count": 1}}
    )
    
    return {"message": "Download tracked successfully"}

@app.get("/downloads/user/{user_id}")
async def get_user_downloads(user_id: str):
    downloads = []
    async for download in db.user_downloads.find({"user_id": ObjectId(user_id)}):
        downloads.append(serialize_object(download))
    return {"downloads": downloads}

@app.get("/downloads/material/{material_id}")
async def get_material_downloads(material_id: str):
    downloads = []
    async for download in db.user_downloads.find({"material_id": ObjectId(material_id)}):
        downloads.append(serialize_object(download))
    return {"downloads": downloads}

# =============== USER ENROLLMENT ROUTES ===============

@app.post("/enrollments")
async def enroll_user_in_course(enrollment_data: dict, user_id: str = Depends(get_current_user)):
    # Check if user already enrolled
    existing_enrollment = await db.user_enrollments.find_one({
        "user_id": ObjectId(user_id),
        "course_id": ObjectId(enrollment_data["course_id"])
    })
    
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="User already enrolled in this course")
    
    enrollment_dict = {
        "user_id": ObjectId(user_id),
        "course_id": ObjectId(enrollment_data["course_id"]),
        "enrollment_date": datetime.utcnow(),
        "status": "active",
        "progress": 0,
        "payment_status": enrollment_data.get("payment_status", "pending"),
        "amount_paid": enrollment_data.get("amount_paid", 0),
        "certificate_issued": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.user_enrollments.insert_one(enrollment_dict)
    
    # Update course enrolled students count
    await db.courses.update_one(
        {"_id": ObjectId(enrollment_data["course_id"])},
        {"$inc": {"enrolled_students": 1}}
    )
    
    return {"message": "User enrolled successfully", "enrollment_id": str(result.inserted_id)}

@app.get("/enrollments/user/{user_id}")
async def get_user_enrollments(user_id: str):
    enrollments = []
    async for enrollment in db.user_enrollments.find({"user_id": ObjectId(user_id)}):
        enrollments.append(serialize_object(enrollment))
    return {"enrollments": enrollments}

@app.get("/enrollments/course/{course_id}")
async def get_course_enrollments(course_id: str):
    enrollments = []
    async for enrollment in db.user_enrollments.find({"course_id": ObjectId(course_id)}):
        enrollments.append(serialize_object(enrollment))
    return {"enrollments": enrollments}

@app.get("/enrollments/{enrollment_id}")
async def get_enrollment(enrollment_id: str):
    enrollment = await db.user_enrollments.find_one({"_id": ObjectId(enrollment_id)})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"enrollment": serialize_object(enrollment)}

@app.put("/enrollments/{enrollment_id}")
async def update_enrollment(enrollment_id: str, enrollment_data: dict):
    enrollment_data["updated_at"] = datetime.utcnow()
    result = await db.user_enrollments.update_one(
        {"_id": ObjectId(enrollment_id)},
        {"$set": enrollment_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Enrollment updated successfully"}

@app.delete("/enrollments/{enrollment_id}")
async def delete_enrollment(enrollment_id: str):
    result = await db.user_enrollments.delete_one({"_id": ObjectId(enrollment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Enrollment deleted successfully"}

# =============== ADDITIONAL UTILITY ROUTES ===============

@app.get("/")
async def root():
    return {"message": "VIDYARTHI MITRAA API is running successfully!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# =============== DASHBOARD & ANALYTICS ROUTES ===============

@app.get("/dashboard/stats")
async def get_dashboard_stats():
    # Get counts for dashboard
    total_users = await db.users.count_documents({})
    total_courses = await db.courses.count_documents({})
    total_tests = await db.online_tests.count_documents({})
    total_materials = await db.materials.count_documents({})
    total_enrollments = await db.user_enrollments.count_documents({})
    
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_tests": total_tests,
        "total_materials": total_materials,
        "total_enrollments": total_enrollments,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/dashboard/recent-activities")
async def get_recent_activities():
    # Get recent activities
    recent_users = []
    async for user in db.users.find().sort("created_at", -1).limit(5):
        recent_users.append(serialize_object(user))
    
    recent_enrollments = []
    async for enrollment in db.user_enrollments.find().sort("created_at", -1).limit(5):
        recent_enrollments.append(serialize_object(enrollment))
    
    recent_test_attempts = []
    async for attempt in db.user_test_attempts.find().sort("created_at", -1).limit(5):
        recent_test_attempts.append(serialize_object(attempt))
    
    return {
        "recent_users": recent_users,
        "recent_enrollments": recent_enrollments,
        "recent_test_attempts": recent_test_attempts
    }

# =============== SEARCH ROUTES ===============

@app.get("/search/courses")
async def search_courses(query: str = "", category: str = "", limit: int = 10):
    filter_dict = {}
    
    if query:
        filter_dict["$or"] = [
            {"name": {"$regex": query, "$options": "i"}},
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
        ]
    
    if category:
        filter_dict["category"] = category
    
    courses = []
    async for course in db.courses.find(filter_dict).limit(limit):
        courses.append(serialize_object(course))
    
    return {"courses": courses}

@app.get("/search/materials")
async def search_materials(query: str = "", subject: str = "", course: str = "", limit: int = 10):
    filter_dict = {}
    
    if query:
        filter_dict["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"subject": {"$regex": query, "$options": "i"}}
        ]
    
    if subject:
        filter_dict["subject"] = subject
    
    if course:
        filter_dict["course"] = course
    
    materials = []
    async for material in db.materials.find(filter_dict).limit(limit):
        materials.append(serialize_object(material))
    
    return {"materials": materials}

@app.get("/search/tests")
async def search_tests(query: str = "", subject: str = "", difficulty: str = "", limit: int = 10):
    filter_dict = {}
    
    if query:
        filter_dict["$or"] = [
            {"test_title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"subject": {"$regex": query, "$options": "i"}}
        ]
    
    if subject:
        filter_dict["subject"] = subject
    
    if difficulty:
        filter_dict["difficulty_level"] = difficulty
    
    tests = []
    async for test in db.online_tests.find(filter_dict).limit(limit):
        tests.append(serialize_object(test))
    
    return {"tests": tests}

# =============== FEEDBACK ROUTES ===============

@app.post("/feedback/material/{material_id}")
async def add_material_feedback(material_id: str, feedback_data: dict, user_id: str = Depends(get_current_user)):
    feedback = {
        "user_id": ObjectId(user_id),
        "rating": feedback_data["rating"],
        "comment": feedback_data.get("comment", ""),
        "created_at": datetime.utcnow()
    }
    
    result = await db.materials.update_one(
        {"_id": ObjectId(material_id)},
        {"$push": {"feedback": feedback}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    
    return {"message": "Feedback added successfully"}

@app.post("/feedback/test/{test_id}")
async def add_test_feedback(test_id: str, feedback_data: dict, user_id: str = Depends(get_current_user)):
    feedback = {
        "user_id": ObjectId(user_id),
        "rating": feedback_data["rating"],
        "comment": feedback_data.get("comment", ""),
        "created_at": datetime.utcnow()
    }
    
    result = await db.online_tests.update_one(
        {"_id": ObjectId(test_id)},
        {"$push": {"feedback": feedback}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    
    return {"message": "Feedback added successfully"}

@app.post("/feedback/course/{course_id}")
async def add_course_feedback(course_id: str, feedback_data: dict, user_id: str = Depends(get_current_user)):
    feedback = {
        "rating": feedback_data["rating"],
        "comment": feedback_data.get("comment", ""),
        "feedback_date": datetime.utcnow()
    }
    
    result = await db.user_enrollments.update_one(
        {"user_id": ObjectId(user_id), "course_id": ObjectId(course_id)},
        {"$set": {"feedback": feedback, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    return {"message": "Course feedback added successfully"}

# =============== FILE UPLOAD ROUTES ===============

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_path = await save_file(file, "images")
    return {"message": "Image uploaded successfully", "file_path": file_path}

@app.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    file_path = await save_file(file, "videos")
    return {"message": "Video uploaded successfully", "file_path": file_path}

@app.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    file_path = await save_file(file, "pdfs")
    return {"message": "PDF uploaded successfully", "file_path": file_path}

# =============== BULK OPERATIONS ROUTES ===============

@app.post("/bulk/questions")
async def bulk_create_questions(questions_data: List[TestQuestionCreate]):
    questions_list = []
    for question in questions_data:
        question_dict = {
            **question.dict(),
            "test_id": ObjectId(question.test_id),
            "difficulty_level": "Medium",
            "tags": [],
            "created_at": datetime.utcnow()
        }
        questions_list.append(question_dict)
    
    result = await db.test_questions.insert_many(questions_list)
    return {"message": f"{len(result.inserted_ids)} questions created successfully"}

@app.post("/bulk/materials")
async def bulk_create_materials(materials_data: List[MaterialCreate]):
    materials_list = []
    for material in materials_data:
        material_dict = {
            **material.dict(),
            "download_count": 0,
            "tags": [],
            "feedback": [],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        materials_list.append(material_dict)
    
    result = await db.materials.insert_many(materials_list)
    return {"message": f"{len(result.inserted_ids)} materials created successfully"}

# =============== RUN SERVER ===============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
