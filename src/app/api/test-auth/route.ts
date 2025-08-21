import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing authentication...')
    
    // Get user ID from headers
    const userId = request.headers.get('X-User-ID')
    console.log('🔍 Auth result: User ID from headers:', userId)
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: 'No user ID in headers',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }
    
    // Use admin client to verify user and role
    const adminSupabase = createAdminClient()
    
    // Check if user exists and is a recruiter
    const { data: profile, error: profileError } = await adminSupabase
      .from('users')
      .select('role, name')
      .eq('id', userId)
      .single()

    console.log('🔍 Profile result:', { profile, error: profileError?.message })

    if (profileError || !profile) {
      return NextResponse.json({ 
        error: 'User not found', 
        details: profileError?.message || 'User not found in database',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    if (profile.role !== 'recruiter') {
      return NextResponse.json({ 
        error: 'Forbidden', 
        details: `User role is ${profile.role}, expected recruiter`,
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
