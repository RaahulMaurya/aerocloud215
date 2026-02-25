// API route to create Razorpay order
import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { getRazorpayConfig } from "@/lib/razorpay"

export async function POST(request: NextRequest) {
  try {
    const { amount, planId } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount. Plan must have a price > 0." }, { status: 400 })
    }

    const config = getRazorpayConfig()
    const razorpay = new Razorpay(config)

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId,
      },
    })

    return NextResponse.json({ orderId: order.id, amount: order.amount })
  } catch (error: any) {
    console.error("Razorpay Order Error:", error)

    // Check for authentication error
    if (error.statusCode === 401 || (error.error && error.error.description === 'Authentication failed')) {
      return NextResponse.json({
        error: "Razorpay Authentication Failed",
        details: "Your Razorpay Key ID or Secret is invalid. Please update RAZORPAY_KEY_ID and RAZORPAY_SECRET in your .env.local file."
      }, { status: 401 })
    }

    return NextResponse.json({
      error: "Failed to create order",
      details: error.message || String(error) || "Unknown error"
    }, { status: 500 })
  }
}
