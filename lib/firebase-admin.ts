import * as admin from 'firebase-admin';

// Unified initialization function
function getApp() {
    if (!admin.apps.length) {
        try {
            console.log('[firebase-admin] Initializing Firebase Admin SDK...');

            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cloudvault-cadca';

            // PRODUCTION (Vercel): Use service account JSON from environment variable.
            // Set FIREBASE_SERVICE_ACCOUNT_JSON in Vercel → Project → Settings → Environment Variables
            // Value: the entire contents of your Firebase service account JSON file as a single string.
            if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: serviceAccount.project_id || projectId,
                });
                console.log('[firebase-admin] Initialized with service account JSON (production mode).');
            } else {
                // LOCAL DEV: Use Application Default Credentials (gcloud auth application-default login)
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    projectId: projectId,
                });
                console.log('[firebase-admin] Initialized with applicationDefault (local dev mode).');
            }
        } catch (error) {
            console.error('[firebase-admin] Fatal initialization error:', error);
            // Last-resort fallback — no-auth init (will fail for authenticated Firestore calls)
            if (!admin.apps.length) {
                try {
                    admin.initializeApp({
                        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cloudvault-cadca'
                    });
                    console.warn('[firebase-admin] Initialized with projectId only — authenticated calls will fail.');
                } catch (fallbackError) {
                    console.error('[firebase-admin] Could not initialize at all:', fallbackError);
                }
            }
        }
    }
    return admin.apps[0];
}

// Lazy-initialized services to prevent crashes on module import
export const getAdminDb = () => {
    getApp();
    return admin.firestore();
};

export const getAdminAuth = () => {
    getApp();
    return admin.auth();
};

export const getAdminStorage = () => {
    getApp();
    return admin.storage();
};

// For backward compatibility (NOT RECOMMENDED for production builds)
// We are removing these to fix build-time "default app does not exist" errors
// Consumers should use getAdminDb(), getAdminAuth(), getAdminStorage() instead

export default admin;
