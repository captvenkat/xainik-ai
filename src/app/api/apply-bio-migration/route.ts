import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerOnly()
    const supabaseClient = await supabase

    // First, check if bio column already exists
    const { data: columns, error: columnsError } = await supabaseClient
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'veterans')
      .eq('table_schema', 'public')
      .eq('column_name', 'bio')

    if (columnsError) {
      console.error('Error checking columns:', columnsError)
      return NextResponse.json(
        { error: 'Failed to check table structure' },
        { status: 500 }
      )
    }

    // If bio column doesn't exist, add it
    if (!columns || columns.length === 0) {
      console.log('Bio column does not exist, adding it...')
      
      // Try to add the bio column using a direct SQL approach
      const { error: alterError } = await supabaseClient.rpc('exec_sql', {
        sql: 'ALTER TABLE public.veterans ADD COLUMN bio text CHECK (length(bio) <= 600);'
      })

      if (alterError) {
        console.error('Error adding bio column via RPC:', alterError)
        
        // Alternative: Try to create a new table with the bio column
        const { error: createError } = await supabaseClient.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS veterans_temp (
              user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
              rank text,
              service_branch text,
              years_experience int,
              location_current text,
              locations_preferred text[],
              bio text CHECK (length(bio) <= 600)
            );
          `
        })

        if (createError) {
          console.error('Error creating temp table:', createError)
          return NextResponse.json(
            { error: 'Could not add bio column. Please run migration manually.' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: false,
          message: 'Bio column could not be added directly. Please run migration manually.',
          suggestion: 'Run: ALTER TABLE public.veterans ADD COLUMN bio text CHECK (length(bio) <= 600);'
        })
      }
    } else {
      console.log('Bio column already exists')
    }

    // Test the migration by checking veterans table structure
    const { data: veterans, error: selectError } = await supabaseClient
      .from('veterans')
      .select('user_id, rank, service_branch, years_experience, bio')
      .limit(1)

    if (selectError) {
      return NextResponse.json(
        { error: 'Failed to query veterans table', details: selectError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Bio migration completed successfully',
      veteransTableStructure: {
        hasBioColumn: true,
        sampleData: veterans?.[0] || null,
        totalColumns: columns?.length || 0
      }
    })

  } catch (error) {
    console.error('Error in bio migration API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
