from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any
import random
import hashlib

def sha256(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

def utc_now() -> datetime:
    return datetime.utcnow()

def seed_users(db) -> List[ObjectId]:
    """Seed comprehensive user data"""
    first_names = [
        "Aarav", "Vihaan", "Ishaan", "Rohit", "Arjun", "Advait", "Dev", "Atharv", "Vivaan",
        "Ananya", "Isha", "Kiara", "Diya", "Aadhya", "Saanvi", "Riya", "Priya", "Nisha", "Meera",
        "Kabir", "Aryan", "Shaurya", "Rudra", "Krishna", "Aditya", "Vedant", "Yash", "Ritvik",
        "Zara", "Aisha", "Fatima", "Sana", "Amara", "Kavya", "Anvi", "Pari", "Myra", "Tara"
    ]
    last_names = [
        "Patel", "Sharma", "Verma", "Gupta", "Iyer", "Agarwal", "Khan", "Singh", "Chopra", "Desai",
        "Kulkarni", "Menon", "Reddy", "Mukherjee", "Das", "Joshi", "Malhotra", "Kapoor", "Tiwari",
        "Chauhan", "Yadav", "Kumar", "Rajput", "Jain", "Bhat", "Nair", "Menon", "Pillai"
    ]
    genders = ["Male", "Female", "Other"]
    educations = ["PUC", "B.Tech", "B.E.", "B.Com", "BBA", "BCA", "B.Sc", "M.Tech", "MCA", "MBA", "M.Com"]
    
    users = []
    for i in range(100):  # 100 users
        first = random.choice(first_names)
        last = random.choice(last_names)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{i}@example.com"
        dob = datetime(1990 + (i % 15), random.randint(1, 12), random.randint(1, 28))
        
        users.append({
            "name": name,
            "email": email,
            "password": sha256("password123"),
            "contact_no": f"9{random.randint(100000000, 999999999)}",
            "gender": random.choice(genders),
            "dob": dob,
            "education": random.choice(educations),
            "course": "Various Courses",
            "is_active": True,
            "last_login": utc_now(),
            "created_at": utc_now(),
            "updated_at": utc_now(),
        })
    
    result = db.users.insert_many(users)
    print(f"✅ Created {len(result.inserted_ids)} users")
    return result.inserted_ids

def seed_institutions(db) -> List[ObjectId]:
    """Seed comprehensive institution data"""
    institutions_data = [
        {
            "name": "Vidyarthi Mitraa Educational Institute",
            "description": "Premier educational institution providing comprehensive coaching for all competitive exams and academic courses.",
            "vision": "To become the leading educational platform empowering students to achieve their dreams through quality education and personalized guidance.",
            "mission": "To provide accessible, high-quality education that transforms lives and builds successful careers."
        },
        {
            "name": "Karnataka State Education Board",
            "description": "Official state education board responsible for PUC and school education standards.",
            "vision": "Excellence in education for all students across Karnataka.",
            "mission": "To maintain high educational standards and ensure quality learning outcomes."
        },
        {
            "name": "University Grants Commission",
            "description": "Statutory body for coordination, determination and maintenance of standards of higher education.",
            "vision": "To promote and coordinate university education in India.",
            "mission": "To ensure quality and standards in higher education institutions."
        },
        {
            "name": "Institute of Chartered Accountants of India",
            "description": "National professional accounting body of India.",
            "vision": "To be a global leader in the profession of accountancy.",
            "mission": "To develop high quality professionals for the accounting profession."
        },
        {
            "name": "Union Public Service Commission",
            "description": "Central agency conducting civil service examinations for Government of India.",
            "vision": "To be the most competent and professional recruitment agency.",
            "mission": "To conduct recruitment examinations with highest standards of fairness and transparency."
        }
    ]
    
    docs = []
    for inst in institutions_data:
        docs.append({
            **inst,
            "created_at": utc_now(),
            "updated_at": utc_now()
        })
    
    result = db.institutions.insert_many(docs)
    print(f"✅ Created {len(result.inserted_ids)} institutions")
    return result.inserted_ids
