#!/bin/bash

echo "Setting up Vidyarthi Mitraa backend..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create dummy images and folders
echo "Creating dummy images and upload folders..."
python3 create_dummy_images.py

# Test the setup
echo "Testing setup..."
python3 test_setup.py

# Seed the database with CSE data
echo "Seeding database with CSE data..."
python3 seed_cse_data.py

echo ""
echo "Setup complete! Your backend is ready with dummy images and seeded data."
echo "IMPORTANT: Restart your FastAPI server with: pm2 restart"
echo "Then test URLs like: https://your-domain.com/uploads/courses/cse101_thumb.jpg"
