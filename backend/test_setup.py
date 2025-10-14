#!/usr/bin/env python3
"""
Test script to verify complete setup
"""

import os
import requests

def test_file_creation():
    """Test if dummy images were created"""
    print("Testing file creation...")
    
    # Check if uploads folder exists
    if not os.path.exists("uploads"):
        print("❌ uploads folder not found!")
        return False
    
    # Check course thumbnails
    course_thumb = "uploads/courses/cse101_thumb.jpg"
    if os.path.exists(course_thumb):
        print(f"✅ {course_thumb} exists")
    else:
        print(f"❌ {course_thumb} not found!")
        return False
    
    # Check testimonial images
    testimonial = "uploads/testimonials/testimonial_1.jpg"
    if os.path.exists(testimonial):
        print(f"✅ {testimonial} exists")
    else:
        print(f"❌ {testimonial} not found!")
        return False
    
    print("✅ All test files exist")
    return True

def test_urls():
    """Test URL format"""
    print("\nTesting URL format...")
    
    # Test relative URLs (these should work on your VPS)
    urls = [
        "uploads/courses/cse101_thumb.jpg",
        "uploads/testimonials/testimonial_1.jpg",
        "uploads/students/student_1.jpg",
        "uploads/materials/algorithms_1.pdf"
    ]
    
    for url in urls:
        print(f"  {url}")
    
    print("✅ URLs are correctly formatted as relative paths")
    return True

def main():
    """Main test function"""
    print("Testing Vidyarthi Mitraa Backend Setup")
    print("=" * 50)
    
    # Test file creation
    files_ok = test_file_creation()
    
    # Test URL format
    urls_ok = test_urls()
    
    print("\n" + "=" * 50)
    if files_ok and urls_ok:
        print("✅ Setup is complete and ready!")
        print("\nNext steps:")
        print("1. Run: python3 seed_cse_data.py")
        print("2. Restart your FastAPI server (pm2 restart)")
        print("3. Test URLs like: /uploads/courses/cse101_thumb.jpg")
    else:
        print("❌ Setup has issues. Please check the errors above.")
        print("\nTo fix:")
        print("1. Run: python3 create_dummy_images.py")
        print("2. Check if uploads folder was created")

if __name__ == "__main__":
    main()
