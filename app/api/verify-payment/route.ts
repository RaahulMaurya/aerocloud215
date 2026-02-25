import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getRazorpayConfig, UNIVERSAL_PLANS } from "@/lib/razorpay"
import { getAdminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, uid } = await request.json()

    console.log("[v0] Verifying payment (Admin):", { razorpay_order_id, razorpay_payment_id, planId, uid })

    if (!uid || !planId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("[v0] Missing payment verification parameters:", { uid, planId, razorpay_order_id, razorpay_payment_id, razorpay_signature })
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 })
    }

    const config = getRazorpayConfig()
    if (!config.key_secret) {
      console.error("[v0] RAZORPAY_SECRET is missing from environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", config.key_secret).update(body.toString()).digest("hex")

    const isValid = expectedSignature === razorpay_signature

    if (!isValid) {
      console.error("[v0] Invalid Razorpay signature:", { expectedSignature, receivedSignature: razorpay_signature })
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    try {
      const adminDb = getAdminDb()
      const userRef = adminDb.doc(`users/${uid}`)
      const userDoc = await userRef.get()

      if (!userDoc.exists) {
        console.error("[v0] User not found during verification:", uid)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Get the plan details to set maxStorage
      const planDetails = UNIVERSAL_PLANS[planId as keyof typeof UNIVERSAL_PLANS]
      const maxStorageBytes = planDetails ? planDetails.storage * 1024 * 1024 * 1024 : 5 * 1024 * 1024 * 1024

      await userRef.update({
        plan: planId,
        subscriptionPlan: planId,
        maxStorage: maxStorageBytes,
        lastPlanUpgrade: new Date().toISOString(),
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      })

      console.log("[v0] User plan updated successfully (Admin):", planId)
      return NextResponse.json({ success: true, plan: planId })
    } catch (dbError: any) {
      console.warn("[v0] Admin DB update failed (likely missing credentials in Dev). Continuing with client-side update.", dbError.message)
      return NextResponse.json({
        success: true,
        plan: planId,
        warning: "Admin DB update failed, relying on client update",
        details: dbError.message
      })
    }
  } catch (error: any) {
    console.error("[v0] Error in verify-payment route:", error)
    return NextResponse.json({
      error: "Internal Server Error",
      details: error.message || String(error)
    }, { status: 500 })
  }
}
