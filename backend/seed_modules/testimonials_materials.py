from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any
import random

def utc_now() -> datetime:
    return datetime.utcnow()

def seed_testimonials_comprehensive(db) -> List[ObjectId]:
    """Seed comprehensive testimonial data"""
    
    testimonial_templates = [
        "Transformed my career completely!",
        "Excellent hands-on learning experience",
        "Best course I've ever taken",
        "Highly recommended for beginners",
        "Great mentor support throughout",
        "Practical and industry-relevant content",
        "Cracked my competitive exam",
        "Robust curriculum and projects",
        "Outstanding faculty and resources",
        "Life-changing educational experience",
        "Perfect for working professionals",
        "Comprehensive study material",
        "Excellent doubt clearing sessions",
        "Great value for money",
        "Professional approach to teaching"
    ]
    
    course_categories = [
        "PUC Science", "PUC Commerce", "B.Com", "BBA", "BCA", "B.Sc Computer Science",
        "M.Com", "MBA", "MCA", "CA Foundation", "CS Executive", "CMA Intermediate",
        "UPSC Civil Services", "KPSC KAS", "SBI PO", "NEET UG", "JEE Main"
    ]
    
    docs = []
    for i in range(50):  # 50 testimonials
        title = random.choice(testimonial_templates)
        course = random.choice(course_categories)
        
        docs.append({
            "title": title,
            "description": f"I enrolled in {course} and {title.lower()}. The comprehensive study material and expert guidance helped me achieve my goals.",
            "student_name": f"Student {i+1}",
            "course": course,
            "rating": random.randint(4, 5),
            "media_type": random.choice(["image", "video"]),
            "media_url": f"uploads/testimonials/testimonial_{i+1}.jpg",
            "student_image": f"uploads/students/student_{i+1}.jpg",
            "is_active": True,
            "is_featured": i % 8 == 0,  # 12.5% featured
            "created_at": utc_now(),
            "updated_at": utc_now(),
        })
    
    result = db.testimonials.insert_many(docs)
    print(f"✅ Created {len(result.inserted_ids)} testimonials")
    return result.inserted_ids

def seed_materials_comprehensive(db, course_ids: List[ObjectId]) -> List[ObjectId]:
    """Seed comprehensive study material data"""
    
    subjects_by_category = {
        "PUC": ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English", "Kannada"],
        "UG": ["Accounting", "Business Law", "Economics", "Statistics", "Programming", "Database", "Web Development"],
        "PG": ["Advanced Accounting", "Corporate Law", "Financial Management", "Marketing", "Data Science", "AI/ML"],
        "Professional": ["Auditing", "Taxation", "Corporate Law", "Cost Accounting", "Financial Reporting"],
        "Competitive": ["General Studies", "Current Affairs", "Quantitative Aptitude", "Reasoning", "English Language"]
    }
    
    modules = ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5", "Module 6"]
    class_names = ["Foundation", "Intermediate", "Advanced", "Professional", "Expert"]
    
    docs = []
    for i in range(200):  # 200 materials
        category = random.choice(list(subjects_by_category.keys()))
        subject = random.choice(subjects_by_category[category])
        module = random.choice(modules)
        class_name = random.choice(class_names)
        size = random.randint(500_000, 10_000_000)
        
        docs.append({
            "class_name": class_name,
            "course": category,
            "subject": subject,
            "module": module,
            "title": f"{subject} - {module}",
            "description": f"Comprehensive study material for {subject} covering {module.lower()} concepts, practice questions, and solutions.",
            "academic_year": f"{2023 + (i % 3)}-24",
            "time_period": random.randint(30, 180),
            "price": random.choice([0, 9, 19, 29, 39]),
            "file_url": f"uploads/materials/{subject.lower().replace(' ', '_')}_{i+1}.pdf",
            "file_size": size,
            "download_count": random.randint(0, 1000),
            "tags": [subject.lower(), module.lower(), category.lower()],
            "feedback": [],
            "is_active": True,
            "created_at": utc_now(),
            "updated_at": utc_now(),
        })
    
    result = db.materials.insert_many(docs)
    print(f"✅ Created {len(result.inserted_ids)} study materials")
    return result.inserted_ids
