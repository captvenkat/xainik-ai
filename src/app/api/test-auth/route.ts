import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function GET() {
  try {
    console.log('🔍 Testing authentication...')
    
    const supabase = await createSupabaseServerOnly()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔍 Auth result:', { user: user?.id, error: authError?.message })
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authError?.message || 'No user found',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    // Check if user is a recruiter
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', user.id)
      .single()

    console.log('🔍 Profile result:', { profile, error: profileError?.message })

    if (profileError) {
      return NextResponse.json({ 
        error: 'Profile fetch failed', 
        details: profileError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    if (profile?.role !== 'recruiter') {
      return NextResponse.json({ 
        error: 'Forbidden', 
        details: `User role is ${profile?.role}, expected recruiter`,
        timestamp: new Date().toISOString()
      }, { status: 403 })
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, role: profile.role, name: profile.name },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('🔍 Test auth error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
