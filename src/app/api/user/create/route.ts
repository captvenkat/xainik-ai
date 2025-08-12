import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already exists in the users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'User already exists',
        user: existingUser 
      })
    }

    // Parse request body for additional user data
    const body = await request.json()
    const { role = 'veteran', name } = body

    // Validate role
    if (!['veteran', 'recruiter', 'supporter', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Create user record
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        name: name || 
              user.user_metadata?.full_name || 
              user.user_metadata?.name || 
              user.email?.split('@')[0] || 'User',
        role: role
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json({ 
        error: 'Failed to create user record' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: newUser 
    })

  } catch (error) {
    console.error('Error in user creation API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
