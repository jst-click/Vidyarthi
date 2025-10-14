from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any
import random
import hashlib
import os

from pymongo import MongoClient

# Import all seeding modules
from seed_modules.users_institutions import seed_users, seed_institutions
from seed_modules.courses import seed_courses_comprehensive
from seed_modules.testimonials_materials import seed_testimonials_comprehensive, seed_materials_comprehensive
from seed_modules.tests_questions import seed_tests_comprehensive, seed_test_questions_comprehensive
from seed_modules.content_others import (
    seed_current_affairs, seed_terms_conditions, 
    seed_contact_info, seed_enrollments_feedback_comprehensive
)

# Settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "vidyarthi_mitraa")
BASE_URL = ""  # Empty for relative paths

def main(reset: bool = True):
    """Main seeding function"""
    client = MongoClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    if reset:
        print("Clearing existing data...")
        for coll in [
            "users", "institutions", "courses", "testimonials", "materials", 
            "online_tests", "test_questions", "current_affairs", "terms_conditions",
            "contacts", "user_enrollments"
        ]:
            db[coll].delete_many({})
    
    print("Starting comprehensive data seeding...")
    print("This script will seed data for all course categories including PUC, UG, PG, Professional, and Competitive exams.")
    print("=" * 80)
    
    # Seed all data using modular functions
    print("\n1. Seeding Users and Institutions...")
    user_ids = seed_users(db)
    institution_ids = seed_institutions(db)
    
    print("\n2. Seeding Courses...")
    course_ids = seed_courses_comprehensive(db)
    
    print("\n3. Seeding Testimonials and Materials...")
    testimonial_ids = seed_testimonials_comprehensive(db)
    material_ids = seed_materials_comprehensive(db, course_ids)
    
    print("\n4. Seeding Tests and Questions...")
    test_ids = seed_tests_comprehensive(db, course_ids)
    question_ids = seed_test_questions_comprehensive(db, test_ids)
    
    print("\n5. Seeding Content and Others...")
    current_affairs_ids = seed_current_affairs(db)
    terms_ids = seed_terms_conditions(db)
    seed_contact_info(db)
    
    print("\n6. Seeding Enrollments and Feedback...")
    seed_enrollments_feedback_comprehensive(db, user_ids, course_ids, material_ids, test_ids)
    
    print("\n" + "=" * 80)
    print("🎉 Comprehensive data seeding completed successfully!")
    print("\n📊 Summary of Created Data:")
    print(f"  👥 Users: {len(user_ids)}")
    print(f"  🏛️  Institutions: {len(institution_ids)}")
    print(f"  🎓 Courses: {len(course_ids)}")
    print(f"  💬 Testimonials: {len(testimonial_ids)}")
    print(f"  📚 Study Materials: {len(material_ids)}")
    print(f"  📝 Practice Tests: {len(test_ids)}")
    print(f"  ❓ Test Questions: {len(question_ids)}")
    print(f"  📰 Current Affairs: {len(current_affairs_ids)}")
    print(f"  📋 Terms & Conditions: {len(terms_ids)}")
    
    print("\n🎯 Course Categories Covered:")
    print("  • PUC (I & II PUC - Science, Commerce, Arts)")
    print("  • UG Courses (B.Com, BBA, BCA, B.Sc)")
    print("  • PG Courses (M.Com, MBA, MCA, MFA, MTA, M.Ed)")
    print("  • UGC Exams (NET, KSET, NEET, JEE)")
    print("  • Professional Courses (CA, CS, CMA, ACCA)")
    print("  • Competitive Exams (KPSC, UPSC, Banking, Railway, SSC, Defence)")
    
    print("\n🚀 Next Steps:")
    print("  1. Create dummy images: python3 create_comprehensive_images.py")
    print("  2. Restart your FastAPI server: pm2 restart")
    print("  3. Test your comprehensive API endpoints")
    print("  4. Access your data at: /courses, /materials, /tests, /current-affairs")

if __name__ == "__main__":
    main(reset=True)
