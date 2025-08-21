import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

    return NextResponse.json({
      success: true,
      razorpay: {
        keyId: razorpayKeyId ? 'Set' : 'Missing',
        keySecret: razorpayKeySecret ? 'Set' : 'Missing',
        publicKeyId: publicKeyId ? 'Set' : 'Missing'
      },
      message: 'Razorpay configuration check'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
