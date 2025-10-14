from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Dict, Any
import random
import hashlib
import os

from pymongo import MongoClient


# Settings (align with backend/main.py)
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "vidyarthi_mitraa")

# Base URL for your server - use relative paths for local development
# BASE_URL = "https://server.globaledutechlearn.com"  # Uncomment for production
BASE_URL = ""  # Empty for relative paths


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def utc_now() -> datetime:
    return datetime.utcnow()


def iso_days_from_now(days: int) -> datetime:
    return utc_now() + timedelta(days=days)


def seed_users(db) -> List[ObjectId]:
    first_names = [
        "Aarav", "Vihaan", "Ishaan", "Rohit", "Arjun",
        "Ananya", "Isha", "Kiara", "Diya", "Aadhya",
        "Saanvi", "Riya", "Priya", "Nisha", "Meera",
        "Kabir", "Advait", "Dev", "Atharv", "Vivaan",
    ]
    last_names = [
        "Patel", "Sharma", "Verma", "Gupta", "Iyer",
        "Agarwal", "Khan", "Singh", "Chopra", "Desai",
        "Kulkarni", "Menon", "Reddy", "Mukherjee", "Das",
    ]
    genders = ["Male", "Female", "Other"]
    educations = ["B.Tech", "B.E.", "M.Tech", "MCA"]
    courses = ["Computer Science Engineering", "Information Technology"]

    users = []
    for i in range(40):
        first = random.choice(first_names)
        last = random.choice(last_names)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{i}@example.com"
        dob = datetime(1998 + (i % 6), random.randint(1, 12), random.randint(1, 28))
        users.append(
            {
                "name": name,
                "email": email,
                "password": sha256("password123"),
                "contact_no": f"9{random.randint(100000000, 999999999)}",
                "gender": random.choice(genders),
                "dob": dob,
                "education": random.choice(educations),
                "course": random.choice(courses),
                "is_active": True,
                "last_login": utc_now(),
                "created_at": utc_now(),
                "updated_at": utc_now(),
            }
        )

    result = db.users.insert_many(users)
    return result.inserted_ids


def seed_courses(db) -> List[ObjectId]:
    categories = ["Computer Science", "Programming", "Data Science", "Systems", "AI"]
    sub_categories = [
        "Algorithms", "Operating Systems", "Databases", "Networks", "Machine Learning",
        "Deep Learning", "Distributed Systems", "Compilers", "Cybersecurity", "Cloud"
    ]
    instructors = [
        "Dr. S. Rao", "Prof. A. Mehta", "Dr. N. Kulkarni", "Prof. P. Iyer", "Dr. R. Kapoor",
        "Prof. V. Deshmukh", "Dr. T. Banerjee", "Prof. K. Raina",
    ]
    
    courses_seed: List[Dict[str, Any]] = [
        {
            "name": "CSE101",
            "title": "Introduction to Computer Science",
            "description": "Foundations of computing, problem solving, and Python programming.",
            "category": categories[0],
            "sub_category": "Foundations",
            "duration": "10 weeks",
            "instructor": random.choice(instructors),
            "price": 0.0,
        },
        {
            "name": "CSE201",
            "title": "Data Structures and Algorithms",
            "description": "Core data structures, algorithm design, complexity analysis, coding interviews.",
            "category": categories[0],
            "sub_category": "Algorithms",
            "duration": "12 weeks",
            "instructor": random.choice(instructors),
            "price": 49.0,
        },
        {
            "name": "CSE210",
            "title": "Database Systems",
            "description": "Relational design, SQL, transactions, indexing, NoSQL, replication and sharding.",
            "category": categories[2],
            "sub_category": "Databases",
            "duration": "8 weeks",
            "instructor": random.choice(instructors),
            "price": 39.0,
        },
        {
            "name": "CSE220",
            "title": "Operating Systems",
            "description": "Processes, threads, synchronization, memory, file systems, virtualization.",
            "category": categories[3],
            "sub_category": "Operating Systems",
            "duration": "10 weeks",
            "instructor": random.choice(instructors),
            "price": 59.0,
        },
        {
            "name": "CSE230",
            "title": "Computer Networks",
            "description": "OSI, TCP/IP, routing, congestion control, wireless, SDN, network security.",
            "category": categories[3],
            "sub_category": "Networks",
            "duration": "9 weeks",
            "instructor": random.choice(instructors),
            "price": 45.0,
        },
        {
            "name": "CSE240",
            "title": "Machine Learning",
            "description": "Supervised and unsupervised learning, model evaluation, scikit-learn, projects.",
            "category": categories[4],
            "sub_category": "Machine Learning",
            "duration": "12 weeks",
            "instructor": random.choice(instructors),
            "price": 89.0,
        },
        {
            "name": "CSE241",
            "title": "Deep Learning",
            "description": "Neural networks, CNNs, RNNs, transformers, training pipelines with PyTorch.",
            "category": categories[4],
            "sub_category": "Deep Learning",
            "duration": "12 weeks",
            "instructor": random.choice(instructors),
            "price": 99.0,
        },
        {
            "name": "CSE250",
            "title": "Distributed Systems",
            "description": "RPC, consensus, fault tolerance, CAP, microservices, cloud-native patterns.",
            "category": categories[3],
            "sub_category": "Distributed Systems",
            "duration": "10 weeks",
            "instructor": random.choice(instructors),
            "price": 79.0,
        },
        {
            "name": "CSE260",
            "title": "Cybersecurity Fundamentals",
            "description": "Threat models, cryptography basics, web security, secure coding, incident response.",
            "category": categories[0],
            "sub_category": "Cybersecurity",
            "duration": "8 weeks",
            "instructor": random.choice(instructors),
            "price": 69.0,
        },
        {
            "name": "CSE270",
            "title": "Cloud Computing",
            "description": "Virtualization, containers, orchestration, serverless, observability, cost control.",
            "category": categories[3],
            "sub_category": "Cloud",
            "duration": "8 weeks",
            "instructor": random.choice(instructors),
            "price": 59.0,
        },
    ]

    docs = []
    base_start = iso_days_from_now(-30)
    for idx, c in enumerate(courses_seed):
        start_date = base_start + timedelta(days=idx * 3)
        end_date = start_date + timedelta(days=60)
        docs.append(
            {
                **c,
                "thumbnail_image": f"{BASE_URL}uploads/courses/{c['name'].lower()}_thumb.jpg",
                "start_date": start_date,
                "end_date": end_date,
                "enrolled_students": random.randint(50, 500),
                "status": "active",
                "is_featured": idx % 3 == 0,
                "created_at": utc_now(),
                "updated_at": utc_now(),
            }
        )
    result = db.courses.insert_many(docs)
    return result.inserted_ids


def seed_testimonials(db) -> List[ObjectId]:
    titles = [
        "Transformed my career!",
        "Excellent hands-on learning",
        "Best DS&A course I've taken",
        "Highly recommended for beginners",
        "Great mentor support",
        "Practical and industry-relevant",
        "Cracked my interviews",
        "Robust curriculum and projects",
    ]
    courses_map = [
        "Data Structures and Algorithms",
        "Operating Systems",
        "Database Systems",
        "Machine Learning",
        "Distributed Systems",
        "Computer Networks",
    ]
    media_types = ["image", "video"]

    docs = []
    for i in range(20):
        title = random.choice(titles)
        docs.append(
            {
                "title": title,
                "description": f"I enrolled in {random.choice(courses_map)} and {title.lower()}. The projects were amazing.",
                "student_name": f"Student {i+1}",
                "course": random.choice(courses_map),
                "rating": random.randint(4, 5),
                "media_type": random.choice(media_types),
                "media_url": f"{BASE_URL}uploads/testimonials/testimonial_{i+1}.jpg",
                "student_image": f"{BASE_URL}uploads/students/student_{i+1}.jpg",
                "is_active": True,
                "is_featured": i % 5 == 0,
                "created_at": utc_now(),
                "updated_at": utc_now(),
            }
        )
    result = db.testimonials.insert_many(docs)
    return result.inserted_ids


def seed_materials(db, course_ids: List[ObjectId]) -> List[ObjectId]:
    subjects = [
        "Algorithms", "Data Structures", "SQL", "Normalization", "Transactions",
        "Processes", "Threads", "Memory Management", "TCP/IP", "Routing",
        "Regression", "Classification", "CNNs", "RNNs", "Transformers",
    ]
    modules = ["Module 1", "Module 2", "Module 3", "Module 4"]
    class_names = ["FE", "SE", "TE", "BE"]
    
    docs = []
    for i in range(60):
        course_idx = i % len(course_ids)
        subject = random.choice(subjects)
        module = random.choice(modules)
        size = random.randint(250_000, 5_000_000)
        docs.append(
            {
                "class_name": random.choice(class_names),
                "course": "Computer Science Engineering",
                "subject": subject,
                "module": module,
                "title": f"{subject} - {module}",
                "description": f"Comprehensive notes and practice problems for {subject}.",
                "academic_year": f"{2023 + (i % 2)}-24",
                "time_period": random.randint(30, 120),
                "price": 0,
                "file_url": f"{BASE_URL}uploads/materials/{subject.lower().replace(' ', '_')}_{i+1}.pdf",
                "file_size": size,
                "download_count": random.randint(0, 500),
                "tags": [subject.lower(), module.lower()],
                "feedback": [],
                "is_active": True,
                "created_at": utc_now(),
                "updated_at": utc_now(),
            }
        )
    result = db.materials.insert_many(docs)
    return result.inserted_ids


def seed_tests(db, course_ids: List[ObjectId]) -> List[ObjectId]:
    subjects = [
        "Algorithms", "Operating Systems", "Databases", "Networks", "Machine Learning",
        "Distributed Systems", "Cybersecurity", "Cloud Computing",
    ]
    difficulties = ["Easy", "Medium", "Hard"]
    docs = []
    for i in range(16):
        subject = random.choice(subjects)
        ttl = f"{subject} Practice Test {1 + (i % 4)}"
        total_q = random.choice([20, 25, 30])
        duration = random.choice([30, 45, 60])
        total_marks = total_q
        pass_mark = int(total_marks * 0.4)
        docs.append(
            {
                "class_name": random.choice(["SE", "TE", "BE"]),
                "course": "Computer Science Engineering",
                "subject": subject,
                "module": random.choice(["Module 1", "Module 2", "Module 3"]),
                "test_title": ttl,
                "description": f"Timed test covering core {subject} concepts.",
                "total_questions": total_q,
                "total_marks": total_marks,
                "duration": duration,
                "difficulty_level": random.choice(difficulties),
                "time_period": 60,
                "pass_mark": pass_mark,
                "date_published": utc_now(),
                "result_type": "Instant",
                "answer_key": True,
                "tags": [subject.lower(), "practice"],
                "attempts_count": random.randint(1, 5),
                "feedback": [],
                "is_active": True,
                "created_at": utc_now(),
                "updated_at": utc_now(),
            }
        )
    result = db.online_tests.insert_many(docs)
    return result.inserted_ids


def seed_test_questions(db, test_ids: List[ObjectId]) -> List[ObjectId]:
    question_bank = [
        ("What is the time complexity of binary search?", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], "O(log n)"),
        ("Which scheduling algorithm may cause starvation?", ["FCFS", "Round Robin", "SJF", "Priority (preemptive)"], "SJF"),
        ("Which normal form eliminates partial dependency?", ["1NF", "2NF", "3NF", "BCNF"], "2NF"),
        ("Which protocol ensures reliable delivery?", ["IP", "TCP", "UDP", "ICMP"], "TCP"),
        ("Which model regularizes with L1 penalty?", ["Ridge", "Lasso", "ElasticNet", "SVM"], "Lasso"),
        ("Which system provides at-most-once semantics?", ["RPC", "UDP", "HTTP", "gRPC"], "RPC"),
        ("Which attack injects malicious SQL?", ["XSS", "CSRF", "SQLi", "RCE"], "SQLi"),
        ("Which service is serverless compute?", ["EC2", "ECS", "Lambda", "EKS"], "Lambda"),
    ]
    docs = []
    for test_id in test_ids:
        num_q = random.choice([10, 12, 15])
        for qn in range(1, num_q + 1):
            q, opts, ans = random.choice(question_bank)
            options = [{"label": chr(65 + i), "text": t} for i, t in enumerate(opts)]
            docs.append(
                {
                    "test_id": test_id,
                    "question_number": qn,
                    "question": q,
                    "options": options,
                    "correct_answer": ans,
                    "explanation": None,
                    "marks": 1,
                    "difficulty_level": random.choice(["Easy", "Medium"]),
                    "tags": [],
                    "created_at": utc_now(),
                }
            )
    if docs:
        result = db.test_questions.insert_many(docs)
        return result.inserted_ids
    return []


def seed_enrollments_feedback(db, user_ids: List[ObjectId], course_ids: List[ObjectId], material_ids: List[ObjectId], test_ids: List[ObjectId]):
    # Enroll a subset of users to random courses and add course feedback inside enrollment
    enroll_docs = []
    for uid in user_ids:
        chosen_courses = random.sample(course_ids, k=random.randint(1, min(3, len(course_ids))))
        for cid in chosen_courses:
            doc = {
                "user_id": uid,
                "course_id": cid,
                "enrollment_date": utc_now(),
                "status": "active",
                "progress": random.randint(0, 100),
                "payment_status": random.choice(["paid", "pending", "free"]),
                "amount_paid": random.choice([0, 39, 49, 59, 79, 89, 99]),
                "certificate_issued": random.choice([False, False, True]),
                "created_at": utc_now(),
                "updated_at": utc_now(),
            }
            # Some enrollments have feedback
            if random.random() < 0.45:
                doc["feedback"] = {
                    "rating": random.randint(4, 5),
                    "comment": random.choice([
                        "Very informative course with great examples.",
                        "Challenging but rewarding content.",
                        "Loved the projects and mentoring.",
                    ]),
                    "feedback_date": utc_now(),
                }
            enroll_docs.append(doc)
    if enroll_docs:
        db.user_enrollments.insert_many(enroll_docs)

    # Add feedback to a subset of materials (embedded array)
    for mid in random.sample(material_ids, k=max(10, len(material_ids) // 3)):
        fb_count = random.randint(2, 6)
        feedback_items = []
        for _ in range(fb_count):
            feedback_items.append(
                {
                    "user_id": random.choice(user_ids),
                    "rating": random.randint(4, 5),
                    "comment": random.choice([
                        "Concise and helpful notes.",
                        "Great practice problems.",
                        "Well structured and easy to follow.",
                    ]),
                    "created_at": utc_now(),
                }
            )
        db.materials.update_one({"_id": mid}, {"$push": {"feedback": {"$each": feedback_items}}})

    # Add feedback to a subset of tests (embedded array)
    for tid in random.sample(test_ids, k=max(6, len(test_ids) // 2)):
        fb_count = random.randint(2, 5)
        feedback_items = []
        for _ in range(fb_count):
            feedback_items.append(
                {
                    "user_id": random.choice(user_ids),
                    "rating": random.randint(4, 5),
                    "comment": random.choice([
                        "Good coverage of topics.",
                        "Time was just right.",
                        "Challenging questions but fair.",
                    ]),
                    "created_at": utc_now(),
                }
            )
        db.online_tests.update_one({"_id": tid}, {"$push": {"feedback": {"$each": feedback_items}}})


def main(reset: bool = True):
    client = MongoClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    if reset:
        for coll in [
            "users", "courses", "testimonials", "materials", "online_tests",
            "test_questions", "user_enrollments",
        ]:
            db[coll].delete_many({})

    user_ids = seed_users(db)
    course_ids = seed_courses(db)
    testi_ids = seed_testimonials(db)
    material_ids = seed_materials(db, course_ids)
    test_ids = seed_tests(db, course_ids)
    question_ids = seed_test_questions(db, test_ids)
    seed_enrollments_feedback(db, user_ids, course_ids, material_ids, test_ids)

    print("Seed completed:")
    print(f"  Users: {len(user_ids)}")
    print(f"  Courses: {len(course_ids)}")
    print(f"  Testimonials: {len(testi_ids)}")
    print(f"  Materials: {len(material_ids)}")
    print(f"  Tests: {len(test_ids)}")
    print(f"  Test Questions: {len(question_ids)}")
    # Note: Enrollments and feedback are embedded/linked; counts vary.


if __name__ == "__main__":
    main(reset=True)


