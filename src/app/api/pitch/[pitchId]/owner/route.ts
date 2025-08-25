import { NextRequest, NextResponse } from 'next/server'
import { createActionClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pitchId: string }> }
) {
  try {
    const { pitchId } = await params
    
    if (!pitchId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Pitch ID is required' 
      }, { status: 400 })
    }

    const supabase = await createActionClient()
    
    // Get pitch owner user_id (central source of truth)
    const { data: pitch, error } = await supabase
      .from('pitches')
      .select('user_id')
      .eq('id', pitchId)
      .single()

    if (error) {
      console.error('Error fetching pitch owner:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Pitch not found' 
      }, { status: 404 })
    }

    if (!pitch?.user_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Pitch owner not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      userId: pitch.user_id // Central source of truth
    })

  } catch (error) {
    console.error('Error in pitch owner API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
