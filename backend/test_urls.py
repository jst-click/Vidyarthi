#!/usr/bin/env python3
"""
Test script to verify URL formatting in seed data
"""

# For local development (relative paths)
BASE_URL = ""

# For production (uncomment the line below)
# BASE_URL = "https://server.globaledutechlearn.com"

def test_course_urls():
    """Test course thumbnail URLs"""
    courses = ["cse101", "cse201", "cse210", "cse220", "cse230", 
               "cse240", "cse241", "cse250", "cse260", "cse270"]
    
    print("Course Thumbnail URLs:")
    for course in courses:
        url = f"{BASE_URL}uploads/courses/{course}_thumb.jpg"
        print(f"  {course}: {url}")
    print()

def test_testimonial_urls():
    """Test testimonial and student image URLs"""
    print("Testimonial URLs:")
    for i in range(1, 6):  # Show first 5
        media_url = f"{BASE_URL}uploads/testimonials/testimonial_{i}.jpg"
        student_url = f"{BASE_URL}uploads/students/student_{i}.jpg"
        print(f"  Testimonial {i}: {media_url}")
        print(f"  Student {i}: {student_url}")
    print()

def test_material_urls():
    """Test material file URLs"""
    subjects = ["algorithms", "data_structures", "sql"]
    print("Material URLs (first few):")
    for i, subject in enumerate(subjects):
        for j in range(1, 3):  # Show first 2 modules
            url = f"{BASE_URL}uploads/materials/{subject}_{i*4 + j}.pdf"
            print(f"  {subject} Module {j}: {url}")
    print()

def main():
    """Main test function"""
    print("Testing URL formatting for server.globaledutechlearn.com")
    print("=" * 60)
    print()
    
    test_course_urls()
    test_testimonial_urls()
    test_material_urls()
    
    print("URL format verification complete!")
    print(f"All URLs use base: {BASE_URL}")

if __name__ == "__main__":
    main()
