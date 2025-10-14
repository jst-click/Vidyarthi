#!/bin/bash

echo "🚀 Setting up Vidyarthi Mitraa Comprehensive Backend System"
echo "=========================================================="
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create comprehensive dummy images and folders
echo ""
echo "🖼️  Creating comprehensive dummy images and upload folders..."
echo "This covers all course categories: PUC, UG, PG, Professional, and Competitive exams"
python3 create_comprehensive_images.py

# Test the comprehensive setup
echo ""
echo "🧪 Testing comprehensive setup..."
python3 test_setup.py

# Seed the database with comprehensive data
echo ""
echo "🌱 Seeding database with comprehensive data..."
echo "This will create data for all categories including:"
echo "  • PUC (I & II PUC)"
echo "  • UG Courses (B.Com, BBA, BCA, B.Sc)"
echo "  • PG Courses (M.Com, MBA, MCA, MFA, MTA, M.Ed)"
echo "  • UGC Exams (NET, KSET, NEET, JEE)"
echo "  • Professional Courses (CA, CS, CMA, ACCA)"
echo "  • Competitive Exams (KPSC, UPSC, Banking, Railway, etc.)"
echo ""
echo "📁 Using modular seeding system (5 modules):"
echo "  • users_institutions.py - Users & Institutions"
echo "  • courses.py - All course categories"
echo "  • testimonials_materials.py - Testimonials & Study materials"
echo "  • tests_questions.py - Practice tests & Questions"
echo "  • content_others.py - Current affairs, Terms, Contact, Feedback"
python3 seed_comprehensive_data.py

echo ""
echo "🎉 Comprehensive setup completed successfully!"
echo ""
echo "📋 Summary of what was created:"
echo "  📁 Upload folders: 10 directories"
echo "  🎓 Course thumbnails: 60+ images"
echo "  💬 Testimonials: 50 images"
echo "  👤 Student profiles: 50 images"
echo "  📚 Study materials: 200+ files"
echo "  🏛️ Institution images: 5 images"
echo "  📰 Current affairs: 40 images"
echo "  👥 Users: 100+ profiles"
echo "  🎯 Courses: 60+ courses across all categories"
echo "  📝 Tests: 50+ practice tests with questions"
echo "  📊 Current affairs: 100+ articles"
echo ""
echo "⚠️  IMPORTANT: Restart your FastAPI server with:"
echo "   pm2 restart"
echo ""
echo "🔗 Then test your comprehensive API endpoints:"
echo "   • Courses: /courses"
echo "   • Materials: /materials"
echo "   • Tests: /tests"
echo "   • Current Affairs: /current-affairs"
echo "   • Testimonials: /testimonials"
echo ""
echo "✨ Your Vidyarthi Mitraa backend is now ready with comprehensive data!"
