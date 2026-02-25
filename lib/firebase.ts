// Firebase configuration and initialization
import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDxRf6fBZMG3Od0-YkEzSt8-Ea0jx7RZ8I",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cloudvault-cadca.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cloudvault-cadca",

  // 🔥 FIXED HERE
  storageBucket: "cloudvault-cadca.firebasestorage.app",
  // process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cloudvault-cadca.firebasestorage.app",

  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "847472850228",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:847472850228:web:e1c243010f1983595fa161",
}


// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize services
export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = getFirestore(app)

export default app
