import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerOnly()
    
    // Check admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get users data
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, phone, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    // Generate CSV
    const csvHeaders = [
      'ID',
      'Full Name',
      'Email',
      'Role',
      'Phone',
      'Created At'
    ]

    const csvRows = users?.map(user => [
      user.id,
      user.full_name || '',
      user.email,
      user.role,
      user.phone || '',
      new Date(user.created_at).toISOString()
    ]) || []

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Users export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
