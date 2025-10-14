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

def create_course_thumbnails():
    """Create course thumbnail images"""
    courses = [
        "cse101", "cse201", "cse210", "cse220", "cse230", 
        "cse240", "cse241", "cse250", "cse260", "cse270"
    ]
    
    for course in courses:
        create_dummy_image(
            width=400, 
            height=300, 
            text=f"{course.upper()}\nThumbnail", 
            filename=f"{course}_thumb.jpg", 
            folder="uploads/courses"
        )

def create_testimonial_images():
    """Create testimonial and student images"""
    # Testimonial images
    for i in range(1, 21):
        create_dummy_image(
            width=600, 
            height=400, 
            text=f"Testimonial {i}\nStudent Success Story", 
            filename=f"testimonial_{i}.jpg", 
            folder="uploads/testimonials"
        )
    
    # Student profile images
    for i in range(1, 21):
        create_dummy_image(
            width=200, 
            height=200, 
            text=f"Student {i}\nProfile", 
            filename=f"student_{i}.jpg", 
            folder="uploads/students"
        )

def create_material_pdfs():
    """Create dummy PDF files (actually images for now)"""
    subjects = [
        "algorithms", "data_structures", "sql", "normalization", "transactions",
        "processes", "threads", "memory_management", "tcp_ip", "routing",
        "regression", "classification", "cnns", "rnns", "transformers"
    ]
    
    for i, subject in enumerate(subjects):
        for j in range(1, 5):  # 4 modules per subject
            create_dummy_image(
                width=800, 
                height=1000, 
                text=f"{subject.title()}\nModule {j}\nStudy Material", 
                filename=f"{subject}_{i*4 + j}.pdf", 
                folder="uploads/materials"
            )

def create_upload_folders():
    """Create all necessary upload folders"""
    folders = [
        "uploads",
        "uploads/courses",
        "uploads/testimonials", 
        "uploads/students",
        "uploads/materials",
        "uploads/images",
        "uploads/videos",
        "uploads/pdfs"
    ]
    
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"Created folder: {folder}")
        print(f"  Path: {os.path.abspath(folder)}")

def main():
    """Main function to create all dummy images and folders"""
    print("Creating dummy images and folders for uploads...")
    
    # Create upload folders first
    create_upload_folders()
    
    # Create course thumbnails
    print("\nCreating course thumbnails...")
    create_course_thumbnails()
    
    # Create testimonial and student images
    print("\nCreating testimonial and student images...")
    create_testimonial_images()
    
    # Create material PDFs (as images for now)
    print("\nCreating material files...")
    create_material_pdfs()
    
    print("\nAll dummy images and folders created successfully!")
    print("Note: PDF files are created as images for demonstration purposes.")

if __name__ == "__main__":
    main()
