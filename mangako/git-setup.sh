#!/bin/bash

# 1. Enter your GitHub Repository URL below
# Example: REPO_URL="https://github.com/YOUR_USERNAME/mangako.git"
REPO_URL="YOUR_GITHUB_REPO_URL_HERE"

if [ "$REPO_URL" = "YOUR_GITHUB_REPO_URL_HERE" ]; then
    echo "⚠️  Please edit this file and set your REPO_URL first!"
    echo "Open git-setup.sh and replace YOUR_GITHUB_REPO_URL_HERE with your actual repository URL."
    exit 1
fi

# 2. Add remote
git remote add origin "$REPO_URL"

# 3. Rename branch to main (just in case)
git branch -M main

# 4. Push
git push -u origin main

echo "✅ Pushed successfully! Now go to Vercel and deploy."
