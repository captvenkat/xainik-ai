import { NextResponse } from 'next/server'
import EmailService from '@/lib/services/email'

export async function POST(request: Request) {
  try {
    const { donorName, donorEmail, amount, transactionId, isAnonymous, displayName } = await request.json()

    // Validate input
    if (!donorEmail || !amount || !transactionId) {
      return NextResponse.json(
        { error: 'Donor email, amount, and transaction ID are required' },
        { status: 400 }
      )
    }

    if (!donorEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Send donation receipt email using Resend
    const result = await EmailService.sendDonationReceipt({
      donorName: donorName || 'Anonymous',
      donorEmail: donorEmail.toLowerCase().trim(),
      amount: Number(amount),
      transactionId,
      date: new Date().toLocaleDateString('en-IN'),
      isAnonymous: Boolean(isAnonymous),
      displayName: displayName?.trim()
    })

    if (!result.success) {
      console.error('Failed to send donation receipt email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send receipt email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Donation receipt sent successfully!' 
    })

  } catch (error) {
    console.error('Donation receipt API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
