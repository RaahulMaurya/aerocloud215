#!/bin/bash

# CloudVault Firebase Hosting Deployment Script

echo "🚀 CloudVault Firebase Deployment"
echo "=================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
firebase auth:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔐 Logging in to Firebase..."
    firebase login
fi

echo "📦 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "🌍 Deploying to Firebase Hosting..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🎉 Your app is now live at: https://cloudvault-cadca.web.app"
else
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi
