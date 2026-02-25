# CloudVault Firebase Hosting Setup & Deployment Guide

## Prerequisites

1. **Firebase CLI**: Install the Firebase Command Line Tools
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account**: Ensure you have access to your Firebase project (aero-cloud-cadca)

3. **Node.js & npm**: Already installed with your project

## Setup Instructions

### Step 1: Authenticate with Firebase
```bash
firebase login
```
This will open a browser window to authenticate your Firebase account.

### Step 2: Verify Project Configuration
The following files have been configured for you:
- **`.firebaserc`** - Links your project to Firebase (project ID: aero-cloud-cadca)
- **`firebase.json`** - Hosting configuration with cache headers and rewrites
- **`next.config.mjs`** - Updated to use `output: 'standalone'` for Firebase

### Step 3: Build the Application
```bash
npm run build
```
This creates a production-ready build in the `.next` directory.

### Step 4: Deploy to Firebase Hosting
```bash
firebase deploy
```

Or use the convenience script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Deployment Verification

After deployment completes, you can access your app at:
- **Default domain**: https://cloudvault-cadca.web.app
- **Alternate domain**: https://cloudvault-cadca.firebaseapp.com
- **Custom domain**: https://aerocloud.app (requires DNS setup)

## Viewing Deployment History

```bash
firebase hosting:channel:list
```

## Rolling Back a Deployment

```bash
firebase hosting:rollback
```

## Environment Variables

Ensure all environment variables in your `.env` or project settings are set:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_SECRET`
- `SENDGRID_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

For Vercel projects, these are automatically available. For Firebase, configure them in:
- **Environment Variables**: Set in `.env.local` (local development)
- **Firebase Hosting**: Some variables can be set via project settings

## Troubleshooting

### Build Fails
```bash
npm run build
# Check for TypeScript errors
npm run type-check
```

### Deployment Fails
```bash
# Check Firebase project status
firebase projects:describe aero-cloud-cadca

# View deployment logs
firebase functions:log
```

### App Not Loading
1. Check cache headers in `firebase.json`
2. Verify rewrites configuration
3. Check browser console for errors

## Performance Optimization

The configuration includes:
- **Static asset caching**: 1 year for `.js`, `.css`, images (immutable)
- **HTML caching**: No cache, must revalidate for freshness
- **Standalone output**: Smaller, faster deployments

## Next Steps

1. **Custom Domain** (Optional):
   ```bash
   firebase hosting:sites:create aerocloud
   # Then add your domain in Firebase Console
   ```

2. **SSL Certificate**: Automatically provisioned by Firebase

3. **Monitoring**: View analytics in Firebase Console → Hosting → Metrics

Happy hosting! 🚀
