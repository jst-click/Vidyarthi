from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any
import random

def utc_now() -> datetime:
    return datetime.utcnow()

def seed_tests_comprehensive(db, course_ids: List[ObjectId]) -> List[ObjectId]:
    """Seed comprehensive test data"""
    
    test_categories = {
        "PUC": ["Physics", "Chemistry", "Mathematics", "Biology"],
        "UG": ["Accounting", "Economics", "Programming", "Business Law"],
        "PG": ["Advanced Finance", "Data Science", "Corporate Law", "Marketing"],
        "Professional": ["Auditing", "Taxation", "Cost Accounting", "Financial Reporting"],
        "Competitive": ["General Studies", "Current Affairs", "Quantitative Aptitude", "Reasoning"]
    }
    
    difficulties = ["Easy", "Medium", "Hard"]
    
    docs = []
    for i in range(50):  # 50 tests
        category = random.choice(list(test_categories.keys()))
        subject = random.choice(test_categories[category])
        difficulty = random.choice(difficulties)
        
        total_q = random.choice([20, 25, 30, 35, 40])
        duration = random.choice([30, 45, 60, 90, 120])
        total_marks = total_q
        pass_mark = int(total_marks * 0.4)
        
        docs.append({
            "class_name": random.choice(["Foundation", "Intermediate", "Advanced", "Professional"]),
            "course": category,
            "subject": subject,
            "module": random.choice(["Module 1", "Module 2", "Module 3", "Module 4"]),
            "test_title": f"{subject} {difficulty} Practice Test {1 + (i % 5)}",
            "description": f"Comprehensive {difficulty.lower()} level test covering {subject} concepts with detailed solutions.",
            "total_questions": total_q,
            "total_marks": total_marks,
            "duration": duration,
            "difficulty_level": difficulty,
            "time_period": 60,
            "pass_mark": pass_mark,
            "date_published": utc_now(),
            "result_type": "Instant",
            "answer_key": True,
            "tags": [subject.lower(), difficulty.lower(), "practice"],
            "attempts_count": random.randint(1, 10),
            "feedback": [],
            "is_active": True,
            "created_at": utc_now(),
            "updated_at": utc_now(),
        })
    
    result = db.online_tests.insert_many(docs)
    print(f"✅ Created {len(result.inserted_ids)} practice tests")
    return result.inserted_ids

def seed_test_questions_comprehensive(db, test_ids: List[ObjectId]) -> List[ObjectId]:
    """Seed comprehensive test questions"""
    
    question_bank = [
        # PUC Level
        ("What is the SI unit of force?", ["Newton", "Joule", "Watt", "Pascal"], "Newton"),
        ("Which gas is called dry ice?", ["CO2", "H2O", "O2", "N2"], "CO2"),
        ("What is the value of π (pi)?", ["3.14", "3.41", "2.71", "1.41"], "3.14"),
        ("Which organ pumps blood?", ["Heart", "Lung", "Liver", "Kidney"], "Heart"),
        ("What is the chemical symbol for gold?", ["Au", "Ag", "Fe", "Cu"], "Au"),
        ("Which planet is closest to the Sun?", ["Mercury", "Venus", "Earth", "Mars"], "Mercury"),
        
        # UG Level
        ("What is the accounting equation?", ["Assets = Liabilities + Equity", "Assets = Liabilities - Equity", "Assets + Liabilities = Equity", "Assets - Liabilities = Equity"], "Assets = Liabilities + Equity"),
        ("What is GDP?", ["Gross Domestic Product", "Gross Domestic Price", "General Domestic Product", "General Domestic Price"], "Gross Domestic Product"),
        ("What is a variable in programming?", ["Storage location", "Function", "Loop", "Condition"], "Storage location"),
        ("What is the primary function of a database?", ["Store data", "Process data", "Display data", "Delete data"], "Store data"),
        ("What is inflation?", ["Rise in price levels", "Fall in price levels", "Stable prices", "Currency devaluation"], "Rise in price levels"),
        
        # PG Level
        ("What is machine learning?", ["AI subset", "Database system", "Programming language", "Operating system"], "AI subset"),
        ("What is corporate governance?", ["Management framework", "Tax system", "Audit process", "Marketing strategy"], "Management framework"),
        ("What is data science?", ["Data analysis field", "Programming language", "Database system", "Operating system"], "Data analysis field"),
        ("What is financial management?", ["Financial planning", "Tax calculation", "Audit process", "Marketing strategy"], "Financial planning"),
        
        # Professional Level
        ("What is auditing?", ["Examination of financial statements", "Tax calculation", "Cost analysis", "Budget preparation"], "Examination of financial statements"),
        ("What is GST?", ["Goods and Services Tax", "General Sales Tax", "Government Service Tax", "Goods Sales Tax"], "Goods and Services Tax"),
        ("What is cost accounting?", ["Cost analysis", "Tax calculation", "Audit process", "Budget preparation"], "Cost analysis"),
        ("What is financial reporting?", ["Financial statements", "Tax calculation", "Cost analysis", "Budget preparation"], "Financial statements"),
        
        # Competitive Level
        ("Who is the current Prime Minister of India?", ["Narendra Modi", "Manmohan Singh", "Atal Bihari Vajpayee", "Rajiv Gandhi"], "Narendra Modi"),
        ("What is the capital of Karnataka?", ["Bangalore", "Mysore", "Mangalore", "Hubli"], "Bangalore"),
        ("What is 15 × 15?", ["225", "215", "235", "245"], "225"),
        ("What is the opposite of 'Happy'?", ["Sad", "Joy", "Glad", "Pleased"], "Sad"),
        ("Which is the largest ocean?", ["Pacific", "Atlantic", "Indian", "Arctic"], "Pacific"),
        ("What is the national flower of India?", ["Lotus", "Rose", "Sunflower", "Tulip"], "Lotus"),
        ("Which year did India gain independence?", ["1947", "1945", "1950", "1948"], "1947"),
        ("What is the currency of Japan?", ["Yen", "Dollar", "Euro", "Pound"], "Yen")
    ]
    
    docs = []
    for test_id in test_ids:
        num_q = random.choice([15, 20, 25, 30])
        for qn in range(1, num_q + 1):
            q, opts, ans = random.choice(question_bank)
            options = [{"label": chr(65 + i), "text": t} for i, t in enumerate(opts)]
            
            docs.append({
                "test_id": test_id,
                "question_number": qn,
                "question": q,
                "options": options,
                "correct_answer": ans,
                "explanation": f"Explanation for question {qn}: {ans} is the correct answer.",
                "marks": 1,
                "difficulty_level": random.choice(["Easy", "Medium", "Hard"]),
                "tags": [],
                "created_at": utc_now(),
            })
    
    if docs:
        result = db.test_questions.insert_many(docs)
        print(f"✅ Created {len(result.inserted_ids)} test questions")
        return result.inserted_ids
    return []
