from PIL import Image, ImageDraw, ImageFont
import os
from typing import List, Tuple

def create_dummy_image(width: int, height: int, text: str, filename: str, folder: str):
    """Create a dummy image with text and save it to the specified folder"""
    # Create directory if it doesn't exist
    os.makedirs(folder, exist_ok=True)
    
    # Create a new image with a light background
    img = Image.new('RGB', (width, height), color='#f0f0f0')
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to basic if not available
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        except:
            font = ImageFont.load_default()
    
    # Calculate text position to center it
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw text
    draw.text((x, y), text, fill='#333333', font=font)
    
    # Save the image
    filepath = os.path.join(folder, filename)
    img.save(filepath)
    print(f"Created: {filepath}")

def create_course_thumbnails_comprehensive():
    """Create course thumbnail images for all categories"""
    
    # PUC Courses
    puc_courses = [
        "puc1-sci", "puc1-com", "puc1-arts",
        "puc2-sci", "puc2-com", "puc2-arts"
    ]
    
    # UG Courses
    ug_courses = [
        "bcom-1", "bcom-2", "bcom-3",
        "bba-1", "bba-2", "bba-3",
        "bca-1", "bca-2", "bca-3",
        "bsc-cs", "bsc-math", "bsc-phy"
    ]
    
    # PG Courses
    pg_courses = [
        "mcom-1", "mcom-2",
        "mba-1", "mba-2",
        "mca-1", "mca-2",
        "mfa-1", "mfa-2",
        "mta-1", "mta-2",
        "med-1", "med-2"
    ]
    
    # UGC Exams
    ugc_courses = [
        "net-cs", "net-math", "net-eng",
        "kset-cs", "kset-math",
        "neet-pg", "neet-ug",
        "jee-main", "jee-adv"
    ]
    
    # Professional Courses
    professional_courses = [
        "ca-foundation", "ca-inter", "ca-final",
        "cs-foundation", "cs-executive", "cs-professional",
        "cma-foundation", "cma-inter", "cma-final",
        "acca-f1", "acca-f2", "acca-f3"
    ]
    
    # Competitive Exams
    competitive_courses = [
        "kpsc-kas", "kpsc-psi",
        "upsc-cse", "upsc-ifs",
        "fda-prep", "sda-prep",
        "ca-daily", "ca-weekly", "ca-monthly",
        "bank-sbi", "bank-ibps", "bank-rbi",
        "rrb-ntpc", "rrb-group-d",
        "pdo-prep", "ssc-cgl", "ssc-chsl", "defence-nda"
    ]
    
    all_courses = puc_courses + ug_courses + pg_courses + ugc_courses + professional_courses + competitive_courses
    
    print("Creating course thumbnails...")
    for course in all_courses:
        create_dummy_image(
            width=400, 
            height=300, 
            text=f"{course.upper()}\nCourse Thumbnail", 
            filename=f"{course}_thumb.jpg", 
            folder="uploads/courses"
        )

def create_testimonial_images_comprehensive():
    """Create testimonial and student images"""
    print("Creating testimonial and student images...")
    
    # Testimonial images (50 total)
    for i in range(1, 51):
        create_dummy_image(
            width=600, 
            height=400, 
            text=f"Testimonial {i}\nStudent Success Story\nVidyarthi Mitraa", 
            filename=f"testimonial_{i}.jpg", 
            folder="uploads/testimonials"
        )
    
    # Student profile images (50 total)
    for i in range(1, 51):
        create_dummy_image(
            width=200, 
            height=200, 
            text=f"Student {i}\nProfile Picture", 
            filename=f"student_{i}.jpg", 
            folder="uploads/students"
        )

def create_material_files_comprehensive():
    """Create dummy PDF files (as images) for all subjects"""
    
    # PUC Subjects
    puc_subjects = [
        "physics", "chemistry", "mathematics", "biology", 
        "computer_science", "english", "kannada"
    ]
    
    # UG Subjects
    ug_subjects = [
        "accounting", "business_law", "economics", "statistics", 
        "programming", "database", "web_development"
    ]
    
    # PG Subjects
    pg_subjects = [
        "advanced_accounting", "corporate_law", "financial_management", 
        "marketing", "data_science", "ai_ml"
    ]
    
    # Professional Subjects
    professional_subjects = [
        "auditing", "taxation", "corporate_law", 
        "cost_accounting", "financial_reporting"
    ]
    
    # Competitive Subjects
    competitive_subjects = [
        "general_studies", "current_affairs", "quantitative_aptitude", 
        "reasoning", "english_language"
    ]
    
    all_subjects = puc_subjects + ug_subjects + pg_subjects + professional_subjects + competitive_subjects
    
    print("Creating study material files...")
    for i, subject in enumerate(all_subjects):
        for j in range(1, 5):  # 4 modules per subject
            create_dummy_image(
                width=800, 
                height=1000, 
                text=f"{subject.replace('_', ' ').title()}\nModule {j}\nStudy Material\nVidyarthi Mitraa", 
                filename=f"{subject}_{i*4 + j}.pdf", 
                folder="uploads/materials"
            )

def create_institution_images():
    """Create institution-related images"""
    print("Creating institution images...")
    
    institutions = [
        "vidyarthi_mitraa_main",
        "karnataka_education_board",
        "ugc_commission",
        "icai_institute",
        "upsc_commission"
    ]
    
    for inst in institutions:
        create_dummy_image(
            width=600,
            height=400,
            text=f"{inst.replace('_', ' ').title()}\nInstitution Image",
            filename=f"{inst}.jpg",
            folder="uploads/institutions"
        )

def create_current_affairs_images():
    """Create current affairs images"""
    print("Creating current affairs images...")
    
    categories = ["politics", "economy", "science_technology", "sports", 
                 "international", "environment", "education", "health"]
    
    for i, category in enumerate(categories):
        for j in range(1, 6):  # 5 images per category
            create_dummy_image(
                width=500,
                height=300,
                text=f"{category.replace('_', ' ').title()}\nCurrent Affairs {j}\nVidyarthi Mitraa",
                filename=f"{category}_{j}.jpg",
                folder="uploads/current_affairs"
            )

def create_upload_folders_comprehensive():
    """Create all necessary upload folders"""
    folders = [
        "uploads",
        "uploads/courses",
        "uploads/testimonials", 
        "uploads/students",
        "uploads/materials",
        "uploads/institutions",
        "uploads/current_affairs",
        "uploads/images",
        "uploads/videos",
        "uploads/pdfs"
    ]
    
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"Created folder: {folder}")
        print(f"  Path: {os.path.abspath(folder)}")

def main():
    """Main function to create all comprehensive dummy images and folders"""
    print("Creating comprehensive dummy images and folders for Vidyarthi Mitraa...")
    print("This will cover all course categories: PUC, UG, PG, Professional, and Competitive exams.")
    
    # Create upload folders first
    create_upload_folders_comprehensive()
    
    # Create course thumbnails for all categories
    create_course_thumbnails_comprehensive()
    
    # Create testimonial and student images
    create_testimonial_images_comprehensive()
    
    # Create study material files
    create_material_files_comprehensive()
    
    # Create institution images
    create_institution_images()
    
    # Create current affairs images
    create_current_affairs_images()
    
    print("\n🎉 All comprehensive dummy images and folders created successfully!")
    print("\nSummary of what was created:")
    print("  📁 Upload folders: 10 directories")
    print("  🎓 Course thumbnails: 60+ images")
    print("  💬 Testimonials: 50 images")
    print("  👤 Student profiles: 50 images")
    print("  📚 Study materials: 200+ files")
    print("  🏛️ Institution images: 5 images")
    print("  📰 Current affairs: 40 images")
    print("\nNext steps:")
    print("  1. Run: python3 seed_comprehensive_data.py")
    print("  2. Restart your FastAPI server: pm2 restart")
    print("  3. Test your comprehensive API endpoints")

if __name__ == "__main__":
    main()
