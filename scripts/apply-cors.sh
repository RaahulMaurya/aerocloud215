#!/bin/bash

# Configuration
BUCKET_NAME="cloudvault-cadca.firebasestorage.app"
CORS_FILE="cors.json"

# Check if gsutil is installed
if ! command -v gsutil &> /dev/null; then
    echo "❌ Error: gsutil is not installed or not in your PATH."
    echo "Please install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if cors.json exists
if [ ! -f "$CORS_FILE" ]; then
    echo "❌ Error: $CORS_FILE not found in the current directory."
    exit 1
fi

echo "🚀 Applying CORS configuration to gs://$BUCKET_NAME..."

# Apply CORS config
gsutil cors set "$CORS_FILE" "gs://$BUCKET_NAME"

if [ $? -eq 0 ]; then
    echo "✅ CORS configuration applied successfully!"
    echo "Note: It may take a few minutes for changes to propagate."
    
    # Verify the configuration
    echo "📋 Current CORS configuration:"
    gsutil cors get "gs://$BUCKET_NAME"
else
    echo "❌ Failed to apply CORS configuration."
    echo "Please make sure you are logged in (Run: gcloud auth login)"
fi
