import { NextRequest, NextResponse } from 'next/server'
import { connectSupporterToPitch } from '@/lib/actions/pitch-connections'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supporter_id, pitch_id, connection_source, source_url, user_agent, ip_hash } = body

    if (!supporter_id || !pitch_id) {
      return NextResponse.json(
        { error: 'Missing required fields: supporter_id and pitch_id' },
        { status: 400 }
      )
    }

    const result = await connectSupporterToPitch({
      supporter_id,
      pitch_id,
      connection_source: connection_source || 'registration',
      source_url,
      user_agent,
      ip_hash
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        action: result.action
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in connect-supporter API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
