import { db } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore"

/**
 * Migration script to remove storageTotal field from all user documents
 * This prevents conflicts with the newer maxStorage field
 */
export async function removeStorageTotalField() {
  try {
    console.log("[v0] Starting migration to remove storageTotal field...")
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)

    let updatedCount = 0
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data()
      
      // Only update if storageTotal field exists
      if (userData.storageTotal !== undefined) {
        await updateDoc(doc(db, "users", userDoc.id), {
          storageTotal: deleteField(),
        })
        updatedCount++
        console.log(`[v0] Removed storageTotal from user: ${userDoc.id}`)
      }
    }

    console.log(`[v0] Migration complete! Updated ${updatedCount} users`)
    return { success: true, updated: updatedCount }
  } catch (error) {
    console.error("[v0] Error during migration:", error)
    return { success: false, error }
  }
}

// Run the migration when needed:
// Call removeStorageTotalField() from your admin panel or a one-time setup function
