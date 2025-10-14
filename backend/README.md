# Vidyarthi Mitraa Backend

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Create Dummy Images and Folders
This script creates all necessary upload folders and dummy images for:
- Course thumbnails
- Testimonial images  
- Student profile pictures
- Study material files (as images)

```bash
python3 create_dummy_images.py
```

### 3. Seed Database with CSE Data
This script populates your MongoDB with realistic Computer Science Engineering data:
- 40 users with realistic profiles
- 10 CSE courses (CSE101-CSE270)
- 20 testimonials
- 60 study materials
- 16 practice tests with questions
- User enrollments and feedback

```bash
python3 seed_cse_data.py
```

### 4. Run Everything at Once
```bash
chmod +x setup_and_seed.sh
./setup_and_seed.sh
```

## What Gets Created

### Upload Folders
- `uploads/courses/` - Course thumbnail images
- `uploads/testimonials/` - Testimonial images
- `uploads/students/` - Student profile pictures
- `uploads/materials/` - Study material files
- `uploads/images/`, `uploads/videos/`, `uploads/pdfs/` - Additional upload folders

### Database Collections
- `users` - Student and faculty profiles
- `courses` - CSE course catalog
- `testimonials` - Student success stories
- `materials` - Study resources
- `online_tests` - Practice tests
- `test_questions` - Test questions
- `user_enrollments` - Course enrollments with feedback
- `user_test_attempts` - Test attempt tracking

## Notes
- All images are dummy placeholders with descriptive text
- PDF files are created as images for demonstration
- The seed script resets existing data by default
- All file paths in the database will now exist and be accessible
- **URLs use relative paths for local VPS development**
- **Static file serving is configured in main.py**
- All image/material URLs will work as `/uploads/...` paths

## Testing URLs
You can test the URL formatting with:
```bash
python3 test_urls.py
```

This will show you exactly how the URLs are formatted for your server.
