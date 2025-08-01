#!/bin/bash

# Deploy script for Table 1837 Bar Management System
echo "🚀 Starting deployment process..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from the project root."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Stage all changes
echo "📦 Staging all changes..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "✅ No changes to commit. Everything is up to date!"
    exit 0
fi

# Get commit message from user or use default
if [ -z "$1" ]; then
    COMMIT_MESSAGE="Update Table 1837 Bar Management System - $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MESSAGE="$1"
fi

# Commit changes
echo "💾 Committing changes with message: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# Push to remote
echo "🚀 Pushing to remote repository..."
git push origin $CURRENT_BRANCH

echo "✅ Deployment initiated! Changes will be automatically deployed to Netlify."
echo "🌐 Check your Netlify dashboard for deployment status."
echo "🔗 Your site: https://table1837tavern.bar" 