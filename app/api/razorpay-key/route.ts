// API route to get Razorpay public key
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  // Get key from server-side environment variable
  // This is the public key ID (safe to expose to clients per Razorpay docs)
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_RoR3OCkJF6aJL6"

  return NextResponse.json({ keyId })
}
