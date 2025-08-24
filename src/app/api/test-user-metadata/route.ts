import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 })
    }

    const supabase = createSupabaseServerOnly()
    const supabaseClient = await supabase

    // Get user data including metadata
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id, name, email, metadata')
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user', details: userError }, { status: 500 })
    }

    // Get veteran data if it exists
    const { data: veteranData, error: veteranError } = await supabaseClient
      .from('veterans')
      .select('*')
      .eq('user_id', userId)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        metadata: user.metadata,
        hasMetadata: !!user.metadata,
        metadataKeys: user.metadata ? Object.keys(user.metadata) : []
      },
      veteranData: veteranData || null,
      veteranError: veteranError ? veteranError.message : null,
      hasVeteranProfile: !!veteranData
    })

  } catch (error) {
    console.error('Error testing user metadata:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
