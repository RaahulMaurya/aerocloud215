import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { UNIVERSAL_PLANS } from '../lib/razorpay'

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function fixUserStorage() {
  console.log('[v0] Starting user storage fix...')
  
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    let updatedCount = 0
    let errors = 0
    
    for (const userDoc of snapshot.docs) {
      const user = userDoc.data()
      const plan = user.plan || user.subscriptionPlan || 'free'
      const planDetails = UNIVERSAL_PLANS[plan as keyof typeof UNIVERSAL_PLANS]
      
      if (!planDetails) {
        console.log(`[v0] Unknown plan "${plan}" for user ${user.email}`)
        errors++
        continue
      }
      
      const correctMaxStorageBytes = planDetails.storage * 1024 * 1024 * 1024
      
      // Check if user needs update
      if (user.maxStorage !== correctMaxStorageBytes || user.storageTotal !== undefined) {
        console.log(`[v0] Fixing user ${user.email}:`)
        console.log(`  - Plan: ${plan} (${planDetails.storage}GB)`)
        console.log(`  - Old maxStorage: ${user.maxStorage} bytes`)
        console.log(`  - New maxStorage: ${correctMaxStorageBytes} bytes`)
        
        try {
          await updateDoc(doc(db, 'users', userDoc.id), {
            maxStorage: correctMaxStorageBytes,
            storageTotal: undefined, // Remove conflicting field
          })
          updatedCount++
          console.log(`[v0] ✓ Updated successfully`)
        } catch (updateError) {
          console.error(`[v0] ✗ Failed to update user ${user.email}:`, updateError)
          errors++
        }
      }
    }
    
    console.log(`[v0] Migration complete: ${updatedCount} users fixed, ${errors} errors`)
  } catch (error) {
    console.error('[v0] Migration failed:', error)
  }
}

fixUserStorage()
