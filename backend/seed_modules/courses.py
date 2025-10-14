from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any
import random

def utc_now() -> datetime:
    return datetime.utcnow()

def iso_days_from_now(days: int) -> datetime:
    return utc_now() + timedelta(days=days)

def seed_courses_comprehensive(db) -> List[ObjectId]:
    """Seed comprehensive course data covering all categories"""
    
    # Course categories and subcategories
    course_structure = {
        "PUC": {
            "I PUC": [
                {"name": "PUC1-SCI", "title": "I PUC Science", "description": "Foundation course in Science for PUC students", "price": 0.0},
                {"name": "PUC1-COM", "title": "I PUC Commerce", "description": "Foundation course in Commerce for PUC students", "price": 0.0},
                {"name": "PUC1-ARTS", "title": "I PUC Arts", "description": "Foundation course in Arts for PUC students", "price": 0.0}
            ],
            "II PUC": [
                {"name": "PUC2-SCI", "title": "II PUC Science", "description": "Advanced Science course for PUC students", "price": 0.0},
                {"name": "PUC2-COM", "title": "II PUC Commerce", "description": "Advanced Commerce course for PUC students", "price": 0.0},
                {"name": "PUC2-ARTS", "title": "II PUC Arts", "description": "Advanced Arts course for PUC students", "price": 0.0}
            ]
        },
        "UG Courses": {
            "B.Com": [
                {"name": "BCOM-1", "title": "B.Com First Year", "description": "Bachelor of Commerce First Year", "price": 29.0},
                {"name": "BCOM-2", "title": "B.Com Second Year", "description": "Bachelor of Commerce Second Year", "price": 29.0},
                {"name": "BCOM-3", "title": "B.Com Third Year", "description": "Bachelor of Commerce Third Year", "price": 29.0}
            ],
            "BBA": [
                {"name": "BBA-1", "title": "BBA First Year", "description": "Bachelor of Business Administration First Year", "price": 39.0},
                {"name": "BBA-2", "title": "BBA Second Year", "description": "Bachelor of Business Administration Second Year", "price": 39.0},
                {"name": "BBA-3", "title": "BBA Third Year", "description": "Bachelor of Business Administration Third Year", "price": 39.0}
            ],
            "BCA": [
                {"name": "BCA-1", "title": "BCA First Year", "description": "Bachelor of Computer Applications First Year", "price": 49.0},
                {"name": "BCA-2", "title": "BCA Second Year", "description": "Bachelor of Computer Applications Second Year", "price": 49.0},
                {"name": "BCA-3", "title": "BCA Third Year", "description": "Bachelor of Computer Applications Third Year", "price": 49.0}
            ],
            "B.Sc": [
                {"name": "BSC-CS", "title": "B.Sc Computer Science", "description": "Bachelor of Science in Computer Science", "price": 44.0},
                {"name": "BSC-MATH", "title": "B.Sc Mathematics", "description": "Bachelor of Science in Mathematics", "price": 34.0},
                {"name": "BSC-PHY", "title": "B.Sc Physics", "description": "Bachelor of Science in Physics", "price": 34.0}
            ]
        },
        "PG Courses": {
            "M.Com": [
                {"name": "MCOM-1", "title": "M.Com First Year", "description": "Master of Commerce First Year", "price": 59.0},
                {"name": "MCOM-2", "title": "M.Com Second Year", "description": "Master of Commerce Second Year", "price": 59.0}
            ],
            "MBA": [
                {"name": "MBA-1", "title": "MBA First Year", "description": "Master of Business Administration First Year", "price": 89.0},
                {"name": "MBA-2", "title": "MBA Second Year", "description": "Master of Business Administration Second Year", "price": 89.0}
            ],
            "MCA": [
                {"name": "MCA-1", "title": "MCA First Year", "description": "Master of Computer Applications First Year", "price": 79.0},
                {"name": "MCA-2", "title": "MCA Second Year", "description": "Master of Computer Applications Second Year", "price": 79.0}
            ],
            "MFA": [
                {"name": "MFA-1", "title": "MFA First Year", "description": "Master of Fine Arts First Year", "price": 69.0},
                {"name": "MFA-2", "title": "MFA Second Year", "description": "Master of Fine Arts Second Year", "price": 69.0}
            ],
            "MTA": [
                {"name": "MTA-1", "title": "MTA First Year", "description": "Master of Travel Administration First Year", "price": 64.0},
                {"name": "MTA-2", "title": "MTA Second Year", "description": "Master of Travel Administration Second Year", "price": 64.0}
            ],
            "M.Ed": [
                {"name": "MED-1", "title": "M.Ed First Year", "description": "Master of Education First Year", "price": 54.0},
                {"name": "MED-2", "title": "M.Ed Second Year", "description": "Master of Education Second Year", "price": 54.0}
            ]
        },
        "UGC Exams": {
            "NET": [
                {"name": "NET-CS", "title": "NET Computer Science", "description": "UGC NET Computer Science Preparation", "price": 99.0},
                {"name": "NET-MATH", "title": "NET Mathematics", "description": "UGC NET Mathematics Preparation", "price": 99.0},
                {"name": "NET-ENG", "title": "NET English", "description": "UGC NET English Preparation", "price": 99.0}
            ],
            "KSET": [
                {"name": "KSET-CS", "title": "KSET Computer Science", "description": "Karnataka SET Computer Science", "price": 89.0},
                {"name": "KSET-MATH", "title": "KSET Mathematics", "description": "Karnataka SET Mathematics", "price": 89.0}
            ],
            "NEET": [
                {"name": "NEET-PG", "title": "NEET PG Preparation", "description": "NEET Post Graduate Medical Preparation", "price": 149.0},
                {"name": "NEET-UG", "title": "NEET UG Preparation", "description": "NEET Undergraduate Medical Preparation", "price": 129.0}
            ],
            "JEE": [
                {"name": "JEE-MAIN", "title": "JEE Main Preparation", "description": "JEE Main Engineering Entrance Preparation", "price": 119.0},
                {"name": "JEE-ADV", "title": "JEE Advanced Preparation", "description": "JEE Advanced Engineering Entrance Preparation", "price": 139.0}
            ]
        },
        "Professional Courses": {
            "CA": [
                {"name": "CA-FOUNDATION", "title": "CA Foundation", "description": "Chartered Accountant Foundation Course", "price": 199.0},
                {"name": "CA-INTER", "title": "CA Intermediate", "description": "Chartered Accountant Intermediate Course", "price": 299.0},
                {"name": "CA-FINAL", "title": "CA Final", "description": "Chartered Accountant Final Course", "price": 399.0}
            ],
            "CS": [
                {"name": "CS-FOUNDATION", "title": "CS Foundation", "description": "Company Secretary Foundation Course", "price": 189.0},
                {"name": "CS-EXECUTIVE", "title": "CS Executive", "description": "Company Secretary Executive Course", "price": 289.0},
                {"name": "CS-PROFESSIONAL", "title": "CS Professional", "description": "Company Secretary Professional Course", "price": 389.0}
            ],
            "CMA": [
                {"name": "CMA-FOUNDATION", "title": "CMA Foundation", "description": "Cost & Management Accountant Foundation", "price": 179.0},
                {"name": "CMA-INTER", "title": "CMA Intermediate", "description": "Cost & Management Accountant Intermediate", "price": 279.0},
                {"name": "CMA-FINAL", "title": "CMA Final", "description": "Cost & Management Accountant Final", "price": 379.0}
            ],
            "ACCA": [
                {"name": "ACCA-F1", "title": "ACCA F1 - Accountant in Business", "description": "ACCA Foundation Level 1", "price": 159.0},
                {"name": "ACCA-F2", "title": "ACCA F2 - Management Accounting", "description": "ACCA Foundation Level 2", "price": 159.0},
                {"name": "ACCA-F3", "title": "ACCA F3 - Financial Accounting", "description": "ACCA Foundation Level 3", "price": 159.0}
            ]
        },
        "Competitive Exams": {
            "KPSC": [
                {"name": "KPSC-KAS", "title": "KPSC KAS Preparation", "description": "Karnataka Administrative Service Preparation", "price": 129.0},
                {"name": "KPSC-PSI", "title": "KPSC PSI Preparation", "description": "Police Sub Inspector Preparation", "price": 119.0}
            ],
            "UPSC": [
                {"name": "UPSC-CSE", "title": "UPSC Civil Services", "description": "Union Public Service Commission Civil Services", "price": 199.0},
                {"name": "UPSC-IFS", "title": "UPSC Forest Services", "description": "Indian Forest Service Preparation", "price": 189.0}
            ],
            "FDA": [
                {"name": "FDA-PREP", "title": "FDA Preparation", "description": "First Division Assistant Preparation", "price": 89.0}
            ],
            "SDA": [
                {"name": "SDA-PREP", "title": "SDA Preparation", "description": "Second Division Assistant Preparation", "price": 79.0}
            ],
            "Current Affairs": [
                {"name": "CA-DAILY", "title": "Daily Current Affairs", "description": "Daily Current Affairs Updates", "price": 29.0},
                {"name": "CA-WEEKLY", "title": "Weekly Current Affairs", "description": "Weekly Current Affairs Summary", "price": 49.0},
                {"name": "CA-MONTHLY", "title": "Monthly Current Affairs", "description": "Monthly Current Affairs Magazine", "price": 69.0}
            ],
            "Banking Exams": [
                {"name": "BANK-SBI", "title": "SBI PO Preparation", "description": "State Bank of India PO Preparation", "price": 109.0},
                {"name": "BANK-IBPS", "title": "IBPS PO Preparation", "description": "IBPS Probationary Officer Preparation", "price": 99.0},
                {"name": "BANK-RBI", "title": "RBI Grade B Preparation", "description": "Reserve Bank of India Grade B", "price": 119.0}
            ],
            "Railway Exams": [
                {"name": "RRB-NTPC", "title": "RRB NTPC Preparation", "description": "Railway Recruitment Board NTPC", "price": 89.0},
                {"name": "RRB-GROUP-D", "title": "RRB Group D Preparation", "description": "Railway Recruitment Board Group D", "price": 79.0}
            ],
            "PDO": [
                {"name": "PDO-PREP", "title": "PDO Preparation", "description": "Panchayat Development Officer Preparation", "price": 89.0}
            ],
            "Others": [
                {"name": "SSC-CGL", "title": "SSC CGL Preparation", "description": "Staff Selection Commission CGL", "price": 99.0},
                {"name": "SSC-CHSL", "title": "SSC CHSL Preparation", "description": "Staff Selection Commission CHSL", "price": 89.0},
                {"name": "DEFENCE-NDA", "title": "NDA Preparation", "description": "National Defence Academy Preparation", "price": 129.0}
            ]
        }
    }
    
    instructors = [
        "Dr. S. Rao", "Prof. A. Mehta", "Dr. N. Kulkarni", "Prof. P. Iyer", "Dr. R. Kapoor",
        "Prof. V. Deshmukh", "Dr. T. Banerjee", "Prof. K. Raina", "Dr. M. Sharma", "Prof. L. Patel",
        "Dr. A. Kumar", "Prof. S. Singh", "Dr. R. Verma", "Prof. K. Gupta", "Dr. P. Joshi"
    ]
    
    docs = []
    base_start = iso_days_from_now(-60)
    
    for category, subcategories in course_structure.items():
        for subcategory, courses in subcategories.items():
            for course in courses:
                start_date = base_start + timedelta(days=random.randint(0, 30))
                end_date = start_date + timedelta(days=random.randint(60, 120))
                
                docs.append({
                    **course,
                    "category": category,
                    "sub_category": subcategory,
                    "duration": f"{random.randint(8, 16)} weeks",
                    "instructor": random.choice(instructors),
                    "thumbnail_image": f"uploads/courses/{course['name'].lower()}_thumb.jpg",
                    "start_date": start_date,
                    "end_date": end_date,
                    "enrolled_students": random.randint(50, 800),
                    "status": "active",
                    "is_featured": random.choice([True, False, False, False]),  # 25% featured
                    "created_at": utc_now(),
                    "updated_at": utc_now(),
                })
    
    result = db.courses.insert_many(docs)
    print(f"✅ Created {len(result.inserted_ids)} courses")
    return result.inserted_ids
