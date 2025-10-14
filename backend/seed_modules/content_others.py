from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any
import random

def utc_now() -> datetime:
    return datetime.utcnow()

def seed_current_affairs(db) -> List[ObjectId]:
    """Seed current affairs data"""
    
    categories = ["Politics", "Economy", "Science & Technology", "Sports", "International", "Environment", "Education", "Health"]
    importance_levels = ["High", "Medium", "Low"]
    
    docs = []
    for i in range(100):  # 100 current affairs articles
        category = random.choice(categories)
        importance = random.choice(importance_levels)
        
        docs.append({
            "title": f"{category} Update - {i+1}",
            "content": f"This is a comprehensive article about recent developments in {category.lower()}. It covers important events, analysis, and implications for various competitive exams.",
            "category": category,
            "publish_date": utc_now() - timedelta(days=random.randint(0, 30)),
            "importance": importance,
            "tags": [category.lower(), "current affairs", "competitive exams"],
            "view_count": random.randint(100, 5000),
            "likes": random.randint(10, 500),
            "is_active": True,
            "is_featured": i % 10 == 0,  # 10% featured
            "created_at": utc_now(),
            "updated_at": utc_now(),
        })
    
    result = db.current_affairs.insert_many(docs)
    print(f"✅ Created {len(result.inserted_ids)} current affairs articles")
    return result.inserted_ids

def seed_terms_conditions(db) -> List[ObjectId]:
    """Seed terms and conditions"""
    
    docs = [
        {
            "title": "General Terms and Conditions",
            "content": "These terms govern the use of Vidyarthi Mitraa educational services. Users must comply with all applicable laws and regulations.",
            "effective_date": utc_now(),
            "version": "1.0",
            "is_active": True,
            "created_at": utc_now(),
            "updated_at": utc_now(),
        },
        {
            "title": "Privacy Policy",
            "content": "We respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.",
            "effective_date": utc_now(),
            "version": "1.0",
            "is_active": True,
            "created_at": utc_now(),
            "updated_at": utc_now(),
        },
        {
            "title": "Refund Policy",
            "content": "Our refund policy allows for course cancellations within 7 days of purchase. Refunds are processed within 15 business days.",
            "effective_date": utc_now(),
            "version": "1.0",
            "is_active": True,
            "created_at": utc_now(),
            "updated_at": utc_now(),
        }
    ]
    
    result = db.terms_conditions.insert_many(docs)
    print(f"✅ Created {len(result.inserted_ids)} terms and conditions")
    return result.inserted_ids

def seed_contact_info(db):
    """Seed contact information"""
    
    contact_data = {
        "company_name": "Vidyarthi Mitraa Educational Institute",
        "address": "123 Education Street, Bangalore, Karnataka 560001",
        "phone": "+91-80-1234-5678",
        "mobile": "+91-98765-43210",
        "email": "info@vidyarthimitraa.com",
        "website": "https://vidyarthimitraa.com",
        "working_hours": "Monday - Saturday: 9:00 AM - 7:00 PM",
        "emergency_contact": "+91-98765-43211",
        "social_media": {
            "facebook": "https://facebook.com/vidyarthimitraa",
            "twitter": "https://twitter.com/vidyarthimitraa",
            "instagram": "https://instagram.com/vidyarthimitraa",
            "linkedin": "https://linkedin.com/company/vidyarthimitraa"
        }
    }
    
    db.contacts.insert_one({
        **contact_data,
        "is_active": True,
        "created_at": utc_now(),
        "updated_at": utc_now(),
    })
    print("✅ Created contact information")

def seed_enrollments_feedback_comprehensive(db, user_ids: List[ObjectId], course_ids: List[ObjectId], material_ids: List[ObjectId], test_ids: List[ObjectId]):
    """Seed comprehensive enrollments and feedback"""
    
    # Enroll users in courses
    enroll_docs = []
    for uid in user_ids:
        chosen_courses = random.sample(course_ids, k=random.randint(1, min(5, len(course_ids))))
        for cid in chosen_courses:
            doc = {
                "user_id": uid,
                "course_id": cid,
                "enrollment_date": utc_now() - timedelta(days=random.randint(0, 90)),
                "status": random.choice(["active", "completed", "paused"]),
                "progress": random.randint(0, 100),
                "payment_status": random.choice(["paid", "pending", "free"]),
                "amount_paid": random.choice([0, 29, 39, 49, 59, 79, 89, 99, 119, 139, 159, 199, 299, 399]),
                "certificate_issued": random.choice([False, False, True]),
                "created_at": utc_now(),
                "updated_at": utc_now(),
            }
            
            # Add feedback to some enrollments
            if random.random() < 0.6:  # 60% have feedback
                doc["feedback"] = {
                    "rating": random.randint(4, 5),
                    "comment": random.choice([
                        "Excellent course with comprehensive content.",
                        "Great value for money, highly recommended.",
                        "Outstanding faculty and study material.",
                        "Perfect for competitive exam preparation.",
                        "Very practical and industry-relevant.",
                        "Excellent doubt clearing sessions.",
                        "Great platform for learning.",
                        "Highly structured and organized content."
                    ]),
                    "feedback_date": utc_now(),
                }
            enroll_docs.append(doc)
    
    if enroll_docs:
        db.user_enrollments.insert_many(enroll_docs)
        print(f"✅ Created {len(enroll_docs)} course enrollments")
    
    # Add feedback to materials
    for mid in random.sample(material_ids, k=max(20, len(material_ids) // 4)):
        fb_count = random.randint(3, 8)
        feedback_items = []
        for _ in range(fb_count):
            feedback_items.append({
                "user_id": random.choice(user_ids),
                "rating": random.randint(4, 5),
                "comment": random.choice([
                    "Excellent study material, very comprehensive.",
                    "Great practice questions and solutions.",
                    "Well structured and easy to understand.",
                    "Perfect for exam preparation.",
                    "High quality content, highly recommended.",
                    "Very helpful for competitive exams.",
                    "Excellent explanations and examples.",
                    "Great value for money."
                ]),
                "created_at": utc_now(),
            })
        db.materials.update_one({"_id": mid}, {"$push": {"feedback": {"$each": feedback_items}}})
    
    print("✅ Added feedback to materials")
    
    # Add feedback to tests
    for tid in random.sample(test_ids, k=max(15, len(test_ids) // 3)):
        fb_count = random.randint(2, 6)
        feedback_items = []
        for _ in range(fb_count):
            feedback_items.append({
                "user_id": random.choice(user_ids),
                "rating": random.randint(4, 5),
                "comment": random.choice([
                    "Excellent test with good question variety.",
                    "Perfect difficulty level and time management.",
                    "Great for practice and self-assessment.",
                    "Comprehensive coverage of topics.",
                    "Very helpful for exam preparation.",
                    "Good mix of easy and challenging questions.",
                    "Excellent explanations for answers.",
                    "Great platform for test practice."
                ]),
                "created_at": utc_now(),
            })
        db.online_tests.update_one({"_id": tid}, {"$push": {"feedback": {"$each": feedback_items}}})
    
    print("✅ Added feedback to tests")
