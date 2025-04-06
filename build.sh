#!/usr/bin/env bash
# Exit on error
set -o errexit

# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Make sure we have a db.sqlite3 file
if [ ! -f db.sqlite3 ]; then
    echo "Creating empty db.sqlite3 file"
    touch db.sqlite3
fi

# Create directory for static files
mkdir -p staticfiles

# Apply migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input 