import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerOnly()
    const supabaseClient = await supabase

    // Add bio field to veterans table if it doesn't exist
    const { error: alterError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'veterans' 
            AND column_name = 'bio'
            AND table_schema = 'public'
          ) THEN
            ALTER TABLE public.veterans ADD COLUMN bio text CHECK (length(bio) <= 600);
            RAISE NOTICE 'Added bio field to veterans table';
          END IF;
        END $$;
      `
    })

    if (alterError) {
      console.error('Error adding bio column:', alterError)
      // Try alternative approach - check if column exists first
      const { data: columns } = await supabaseClient
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'veterans')
        .eq('table_schema', 'public')
        .eq('column_name', 'bio')

      if (!columns || columns.length === 0) {
        return NextResponse.json(
          { error: 'Bio column does not exist and could not be added. Please run migration manually.' },
          { status: 500 }
        )
      }
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
      message: 'Bio migration applied successfully',
      veteransTableStructure: {
        hasBioColumn: true,
        sampleData: veterans?.[0] || null
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
