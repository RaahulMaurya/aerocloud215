import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'CloudVault API is accessible',
        diagnostics: {
            hasAiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            hasRazorpaySecret: !!process.env.RAZORPAY_SECRET,
            hasRazorpayKey: !!process.env.RAZORPAY_KEY_ID,
            nodeVersion: process.version,
            env: process.env.NODE_ENV
        }
    });
}
