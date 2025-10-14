#!/usr/bin/env python3
"""
Test script to verify modular seeding system
"""

def test_imports():
    """Test if all modules can be imported correctly"""
    print("Testing modular seeding system imports...")
    
    try:
        from seed_modules.users_institutions import seed_users, seed_institutions
        print("✅ users_institutions module imported successfully")
    except ImportError as e:
        print(f"❌ users_institutions module import failed: {e}")
        return False
    
    try:
        from seed_modules.courses import seed_courses_comprehensive
        print("✅ courses module imported successfully")
    except ImportError as e:
        print(f"❌ courses module import failed: {e}")
        return False
    
    try:
        from seed_modules.testimonials_materials import seed_testimonials_comprehensive, seed_materials_comprehensive
        print("✅ testimonials_materials module imported successfully")
    except ImportError as e:
        print(f"❌ testimonials_materials module import failed: {e}")
        return False
    
    try:
        from seed_modules.tests_questions import seed_tests_comprehensive, seed_test_questions_comprehensive
        print("✅ tests_questions module imported successfully")
    except ImportError as e:
        print(f"❌ tests_questions module import failed: {e}")
        return False
    
    try:
        from seed_modules.content_others import (
            seed_current_affairs, seed_terms_conditions, 
            seed_contact_info, seed_enrollments_feedback_comprehensive
        )
        print("✅ content_others module imported successfully")
    except ImportError as e:
        print(f"❌ content_others module import failed: {e}")
        return False
    
    return True

def test_main_script():
    """Test if the main seeding script can be imported"""
    print("\nTesting main seeding script...")
    
    try:
        import seed_comprehensive_data
        print("✅ Main seeding script imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Main seeding script import failed: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Testing Vidyarthi Mitraa Modular Seeding System")
    print("=" * 60)
    
    # Test module imports
    modules_ok = test_imports()
    
    # Test main script
    main_ok = test_main_script()
    
    print("\n" + "=" * 60)
    if modules_ok and main_ok:
        print("✅ All modules imported successfully!")
        print("\n🎯 Modular system is ready with:")
        print("  📁 5 seed modules")
        print("  🔗 Main orchestrator script")
        print("  📊 Comprehensive data coverage")
        print("\n🚀 Ready to run: python3 seed_comprehensive_data.py")
    else:
        print("❌ Some imports failed. Please check the errors above.")
        print("\n🔧 To fix:")
        print("  1. Ensure all module files exist in seed_modules/")
        print("  2. Check for syntax errors in module files")
        print("  3. Verify Python path and imports")

if __name__ == "__main__":
    main()
