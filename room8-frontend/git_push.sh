#!/bin/bash
# This script commits your changes to GitHub and deploys your Room8 app to Google Cloud App Engine.
# Usage: ./git_push.sh "commit message"

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "You must provide a commit message"
  exit 1
fi

# Check if this is the first time setting up the repository
if [ ! -d ".git" ]; then
  echo "Initializing Git repository for Room8..."
  git init
  
  # Create a README if it doesn't exist
  if [ ! -f "README.md" ]; then
    echo "# Room8" > README.md
    git add README.md
    git commit -m "Initial commit: Adding README for Room8"
  fi
  
  # Set up the remote and push your initial commit
  git remote add origin https://github.com/tillo13/room8.git
  git branch -M main
  git push -u origin main
fi

# Add all changes, commit with the provided message, and push to GitHub
git add .
git commit -m "$1"
git push origin main

if [ $? -ne 0 ]; then
  echo "Git push failed. Please resolve any merge conflicts and try again."
  exit 1
fi

# Deploy to Google App Engine using the Python deployment script
echo "Deploying Room8 to Google Cloud..."
python3 gcloud_deploy.py