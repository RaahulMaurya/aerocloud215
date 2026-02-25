# Aero Cloud - Firebase Setup Guide

This guide explains how to deploy the Firebase security rules and configure your Firebase project for Aero Cloud.

## Firebase Console Configuration

### 1. Navigate to Firebase Console
Go to [Firebase Console](https://console.firebase.google.com) and select your **Aero Cloud** project (currently: `cloudvault-cadca`).

---

## Firestore Database Rules

### How to Deploy Firestore Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace the existing rules with the content from `firestore.rules` file
3. Click **Publish**

### Firestore Collections Structure

Your app uses these collections:

\`\`\`
/users/{userId}
  - displayName: string
  - email: string
  - plan: string
  - storageUsed: number
  - storageTotal: number
  - createdAt: timestamp
  - notifications: object
  - theme: string
  - maxStorage: number (optional)
  - lastNotificationLevel: number (optional)
  - subscriptionPlan: string (optional)

/files/{userId}/userFiles/{fileId}
  - fileId: string
  - name: string
  - displayName: string
  - size: number
  - contentType: string
  - storagePath: string
  - parentPath: string
  - path: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - starred: boolean

/folders/{userId}/userFolders/{folderId}
  - folderId: string
  - name: string
  - createdAt: timestamp
  - updatedAt: timestamp

/sharedLinks/{linkId}
  - fileId: string
  - fileName: string
  - fileUrl: string
  - fileSize: number
  - sharedBy: string (userId)
  - createdAt: timestamp
  - expiresAt: timestamp
  - isExpired: boolean

/activityLogs/{logId}
  - userId: string
  - action: string
  - fileName: string
  - fileType: string
  - timestamp: timestamp
  - details: string

/_server_time/time
  - timestamp: server timestamp (for syncing)
\`\`\`

---

## Firebase Storage Rules

### How to Deploy Storage Rules

1. In Firebase Console, go to **Storage** → **Rules**
2. Replace the existing rules with the content from `storage.rules` file
3. Click **Publish**

### Storage Structure

Your app uses this storage structure:

\`\`\`
gs://cloudvault-cadca.firebasestorage.app/
├── uploads/
│   └── {userId}/
│       ├── {fileId}
│       └── {folderName}/
│           └── {fileId}
└── shared_zips/
    └── {zipId}
\`\`\`

This structure matches your Android app's Firebase structure.

---

## Authentication Setup

### Enable Email/Password Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Save changes

### Optional: Enable Other Providers

You can also enable:
- Google Sign-in
- Facebook Login
- Phone Authentication

---

## Environment Variables

### Required Environment Variables

Add these to your Vercel project or `.env.local` file:

\`\`\`env
# Firebase Configuration (Public - safe for client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxRf6fBZMG3Od0-YkEzSt8-Ea0jx7RZ8I
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cloudvault-cadca.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cloudvault-cadca
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cloudvault-cadca.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=847472850228
NEXT_PUBLIC_FIREBASE_APP_ID=1:847472850228:web:e1c243010f1983595fa161

# Razorpay Configuration (Server-side only - keep secret!)
RAZORPAY_KEY_ID=rzp_test_RoR3OCkJF6aJL6
RAZORPAY_SECRET=bO4RxqhdizMlf1EPkRNHgvyH
\`\`\`

---

## Security Best Practices

### 1. Firestore Security
- ✅ Users can only read/write their own data
- ✅ Shared links are publicly readable (required for sharing)
- ✅ Activity logs are private to each user
- ✅ Server time endpoint is read-only

### 2. Storage Security
- ✅ Users can only access files in their own `uploads/{userId}/` folder
- ✅ Shared zips are publicly readable for sharing functionality
- ✅ All operations require authentication

### 3. Authentication Security
- ✅ Email verification recommended for production
- ✅ Password strength requirements enforced by Firebase
- ✅ Session management handled by Firebase Auth

---

## Syncing with Mobile App

Your web app now uses the same Firebase structure as your Android app:

### Compatible Features:
- ✅ User authentication (shared across platforms)
- ✅ File storage path: `uploads/{userId}/`
- ✅ Firestore collections: `/files/{userId}/userFiles/`
- ✅ Activity logging
- ✅ Shared links

### Synchronized Data:
When a user uploads a file on web, it appears on mobile (and vice versa) because they share:
- Same Storage bucket
- Same Firestore database
- Same authentication system
- Same data structure

---

## Testing the Setup

### 1. Test Authentication
\`\`\`bash
# Create a test account
Email: test@aerocloud.com
Password: Test123456!
\`\`\`

### 2. Test File Upload
1. Upload a small test file (< 1MB)
2. Check Firebase Storage Console
3. Verify file appears at `uploads/{userId}/{fileId}`
4. Verify Firestore document created at `/files/{userId}/userFiles/{fileId}`

### 3. Test Shared Links
1. Upload a file
2. Create a shared link
3. Check Firestore Console for `/sharedLinks/` collection
4. Open link in incognito window to verify public access

### 4. Test Cross-Platform Sync
1. Upload file on web app
2. Open Android app with same account
3. Verify file appears in mobile app
4. Delete from mobile and verify it's removed from web

---

## Troubleshooting

### Permission Denied Errors
**Error**: `Missing or insufficient permissions`

**Solutions**:
1. Verify Firestore rules are published correctly
2. Check Storage rules match the structure above
3. Ensure user is authenticated before accessing data
4. Check browser console for specific collection/path causing error

### Files Not Appearing
**Error**: Files uploaded but not visible

**Solutions**:
1. Check Storage path is `uploads/{userId}/` not `users/{userId}/`
2. Verify Firestore document created at `/files/{userId}/userFiles/`
3. Check browser console for errors
4. Verify Firebase initialization is successful

### Activity Logs Errors
**Error**: `activityLogs` collection permission denied

**Solutions**:
1. Ensure Firestore rules include the `activityLogs` collection rules
2. Check user is authenticated
3. Verify the collection path matches exactly

---

## Migration Notes

### Changes from Original Structure

**Old Structure:**
\`\`\`
Storage: users/{userId}/
Firestore: /users/{userId}
\`\`\`

**New Structure (Compatible with Mobile):**
\`\`\`
Storage: uploads/{userId}/
Firestore: /files/{userId}/userFiles/
         /folders/{userId}/userFolders/
\`\`\`

This structure ensures seamless compatibility between your web and mobile applications.

---

## Production Checklist

Before going live:

- [ ] Replace test Firebase config with production config
- [ ] Enable email verification in Firebase Auth
- [ ] Set up Firebase App Check for security
- [ ] Configure CORS for your domain
- [ ] Set up Firebase billing (Blaze plan) for production scale
- [ ] Enable Firebase Analytics
- [ ] Set up error monitoring (Sentry/Firebase Crashlytics)
- [ ] Test all features in production environment
- [ ] Set up automated backups for Firestore
- [ ] Configure Firebase Performance Monitoring

---

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Security](https://firebase.google.com/docs/storage/security)
- [Firebase Console](https://console.firebase.google.com)
