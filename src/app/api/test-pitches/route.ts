import { createActionClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseAction = await createActionClient()
    
    // Get all active pitches
    const { data: pitches, error } = await supabaseAction
      .from('pitches')
      .select(`
        id,
        title,
        is_active,
        created_at,
        user_id,
        users!pitches_user_id_fkey(name, email)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching pitches:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch pitches', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: pitches?.length || 0,
      pitches: pitches || [],
      message: `Found ${pitches?.length || 0} active pitches`
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
