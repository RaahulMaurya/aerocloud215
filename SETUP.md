# Aero Cloud Setup Guide

This guide will help you set up the Aero Cloud application with Firebase and Razorpay integration.

## Prerequisites

- Node.js 18+ installed
- Firebase account
- Razorpay account (test mode for development)

## Quick Start (v0 Environment)

1. **Add Environment Variables**
   - Open the in-chat sidebar in v0
   - Click on the **Vars** section
   - Add these variables:
   
   \`\`\`
   RAZORPAY_KEY_ID=rzp_test_RoR3OCkJF6aJL6
   RAZORPAY_SECRET=bO4RxqhdizMlf1EPkRNHgvyH
   \`\`\`

2. **Firebase variables are already set**
   The Firebase configuration is pre-loaded in the code with the test project credentials.

3. **Deploy Firebase Rules**
   See `FIREBASE_SETUP.md` for detailed instructions on deploying Firestore and Storage security rules.

4. **Run the app**
   The application will start immediately and you can begin testing!

## Firebase Setup

### IMPORTANT: Deploy Security Rules First

Before using the app, you must deploy the Firebase security rules to avoid permission errors:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `cloudvault-cadca`
3. Deploy Firestore rules from `firestore.rules` file
4. Deploy Storage rules from `storage.rules` file

**See `FIREBASE_SETUP.md` for complete step-by-step instructions.**

## Environment Variables Setup

### For v0 (Current Environment)

Add these in the **Vars section** of the in-chat sidebar:

\`\`\`
RAZORPAY_KEY_ID=rzp_test_RoR3OCkJF6aJL6
RAZORPAY_SECRET=bO4RxqhdizMlf1EPkRNHgvyH
\`\`\`

### For Local Development (.env.local)

Create a `.env.local` file:

\`\`\`env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxRf6fBZMG3Od0-YkEzSt8-Ea0jx7RZ8I
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cloudvault-cadca.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cloudvault-cadca
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cloudvault-cadca.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=847472850228
NEXT_PUBLIC_FIREBASE_APP_ID=1:847472850228:web:e1c243010f1983595fa161

# Razorpay Configuration (Server-side only)
RAZORPAY_KEY_ID=rzp_test_RoR3OCkJF6aJL6
RAZORPAY_SECRET=bO4RxqhdizMlf1EPkRNHgvyH
\`\`\`

**Important Security Notes:**
- `RAZORPAY_KEY_ID` is NOT prefixed with `NEXT_PUBLIC` - it's accessed server-side only
- The key is exposed to clients through a secure API endpoint
- The secret key (`RAZORPAY_SECRET`) never leaves the server

## Firebase Configuration

The project uses the same Firebase structure as your Android mobile app for seamless cross-platform data sync.

### Storage Structure
\`\`\`
uploads/{userId}/{fileId}
uploads/{userId}/{folderName}/{fileId}
shared_zips/{zipId}
\`\`\`

### Firestore Collections
\`\`\`
/users/{userId}
/files/{userId}/userFiles/{fileId}
/folders/{userId}/userFolders/{folderId}
/sharedLinks/{linkId}
/activityLogs/{logId}
\`\`\`

## Razorpay Setup

The Razorpay integration uses server-side environment variables for security.

### How It Works

1. Client requests payment from dashboard
2. Server creates Razorpay order using secret key
3. Server sends public key to client via API
4. Client initializes Razorpay checkout
5. Server verifies payment signature

### Testing Payments

Use these test card details:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **OTP**: 1234

## Features

### Authentication
1. Go to `/auth`
2. Create account with email and password
3. Automatically assigned Free plan (5GB)

### File Upload
1. Login to dashboard
2. Click "Upload Files" tab
3. Drag and drop or browse for files
4. Files uploaded to Firebase Storage at `uploads/{userId}/`
5. Storage usage updated in real-time

### Plan Upgrade
1. Navigate to Settings > Billing
2. Click "Upgrade Plan"
3. Select Pro ($25/mo, 50GB) or Business ($59/mo, 200GB)
4. Complete payment via Razorpay
5. Plan upgraded instantly

### Storage Management
- Real-time storage tracking
- Visual progress bar
- Warnings when nearing limit
- File list with download and delete options

## Cross-Platform Compatibility

Aero Cloud web app is fully compatible with your Android mobile app:

- **Shared Authentication**: Same user accounts work on both platforms
- **Synced Storage**: Files uploaded on web appear on mobile (and vice versa)
- **Real-time Updates**: Changes sync automatically across devices
- **Same Data Structure**: Both apps use identical Firebase paths

## Troubleshooting

### Permission Errors
If you see "Missing or insufficient permissions":
1. Check `FIREBASE_SETUP.md` for rule deployment instructions
2. Verify rules are published in Firebase Console
3. Ensure you're logged in with a valid account

### Payment Not Working
1. Verify environment variables are set in Vars section
2. Check browser console for errors
3. Ensure test card details are correct
4. Verify Razorpay API endpoint is responding

### File Upload Issues
- Verify Firebase Storage rules are deployed
- Check storage rules allow user access at `uploads/{userId}/`
- Ensure file size doesn't exceed plan limit
- Check browser console for specific errors

### Authentication Issues
- Check Firebase Authentication is enabled
- Verify email/password provider is active
- Check browser console for errors

## Production Deployment

### For Production (Vercel/Other Platforms)

Set these environment variables:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_SECRET=your_live_secret
\`\`\`

**Security Best Practices:**
- Use production Firebase project with proper security rules
- Use live Razorpay keys (not test keys)
- Enable Razorpay webhook verification
- Implement rate limiting for API routes
- Set up proper CORS policies
- Enable Firebase App Check for production

## Support

For issues or questions:
- Check `FIREBASE_SETUP.md` for Firebase configuration
- Review Firebase Console: https://console.firebase.google.com
- Check Razorpay Dashboard: https://dashboard.razorpay.com
- Review browser console logs for errors
