import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerOnly()
    const supabaseClient = await supabase

    // Check if veterans table exists
    const { data: tables, error: tablesError } = await supabaseClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'veterans')

    if (tablesError) {
      return NextResponse.json(
        { error: 'Failed to check tables', details: tablesError },
        { status: 500 }
      )
    }

    const veteransTableExists = tables && tables.length > 0

    if (!veteransTableExists) {
      return NextResponse.json({
        error: 'Veterans table does not exist',
        suggestion: 'Create the veterans table first'
      }, { status: 404 })
    }

    // Get veterans table structure
    const { data: columns, error: columnsError } = await supabaseClient
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'veterans')
      .order('ordinal_position')

    if (columnsError) {
      return NextResponse.json(
        { error: 'Failed to get table structure', details: columnsError },
        { status: 500 }
      )
    }

    // Check if there are any existing veteran records
    const { data: veteranCount, error: countError } = await supabaseClient
      .from('veterans')
      .select('user_id', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count veterans', details: countError },
        { status: 500 }
      )
    }

    // Try to get a sample veteran record
    const { data: sampleVeteran, error: sampleError } = await supabaseClient
      .from('veterans')
      .select('*')
      .limit(1)

    return NextResponse.json({
      success: true,
      veteransTableExists,
      tableStructure: columns,
      totalVeterans: veteranCount,
      sampleRecord: sampleError ? null : sampleVeteran?.[0] || null,
      sampleError: sampleError ? sampleError.message : null
    })

  } catch (error) {
    console.error('Error checking veterans table:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
