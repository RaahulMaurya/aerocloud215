import { type NextRequest, NextResponse } from "next/server"
import admin, { getAdminDb } from "@/lib/firebase-admin"

/**
 * Admin API endpoint to clean up legacy storageTotal field from all user documents
 * This should only be called once to fix existing users
 */
export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb()
    // Optional: Add authentication check here to ensure only admins can call this
    const authHeader = request.headers.get("authorization")
    const secretKey = process.env.ADMIN_MIGRATION_KEY

    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      console.log("[v0] Unauthorized migration attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting migration (Admin) to remove storageTotal field...")
    const usersSnapshot = await adminDb.collection("users").get()

    let updatedCount = 0
    const batch = adminDb.batch()

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data()
      if (userData.storageTotal !== undefined) {
        batch.update(userDoc.ref, {
          storageTotal: admin.firestore.FieldValue.delete(),
        })
        updatedCount++
      }
    })

    if (updatedCount > 0) {
      await batch.commit()
    }

    console.log(`[v0] Migration complete! Updated ${updatedCount} users`)
    return NextResponse.json({
      success: true,
      message: `Migration complete! Updated ${updatedCount} users`,
      updatedCount
    })
  } catch (error) {
    console.error("[v0] Error during migration:", error)
    return NextResponse.json({
      error: "Migration failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
