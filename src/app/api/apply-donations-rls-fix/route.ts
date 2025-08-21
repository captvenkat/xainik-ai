import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    
    console.log('Applying donations RLS fix migration...')
    
    // Drop the existing restrictive policy
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS v_donations_owner ON donations;'
    })
    
    if (dropError) {
      console.error('Error dropping existing policy:', dropError)
      return NextResponse.json({ error: 'Failed to drop existing policy' }, { status: 500 })
    }
    
    // Create new policy that allows anonymous donations
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY v_donations_insert ON donations
        FOR INSERT WITH CHECK (
          user_id IS NULL 
          OR 
          user_id = auth.uid()
        );
      `
    })
    
    if (insertError) {
      console.error('Error creating insert policy:', insertError)
      return NextResponse.json({ error: 'Failed to create insert policy' }, { status: 500 })
    }
    
    // Create policy for users to view their own donations
    const { error: selectError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY v_donations_select ON donations
        FOR SELECT USING (
          user_id IS NULL 
          OR 
          user_id = auth.uid()
        );
      `
    })
    
    if (selectError) {
      console.error('Error creating select policy:', selectError)
      return NextResponse.json({ error: 'Failed to create select policy' }, { status: 500 })
    }
    
    // Create policy for users to update their own donations
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY v_donations_update ON donations
        FOR UPDATE USING (
          user_id = auth.uid()
        ) WITH CHECK (
          user_id = auth.uid()
        );
      `
    })
    
    if (updateError) {
      console.error('Error creating update policy:', updateError)
      return NextResponse.json({ error: 'Failed to create update policy' }, { status: 500 })
    }
    
    console.log('Donations RLS fix migration applied successfully!')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Donations RLS policies updated to allow anonymous donations' 
    })
    
  } catch (error) {
    console.error('Error applying donations RLS fix:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Donations RLS fix endpoint ready',
    description: 'POST to apply the migration that allows anonymous donations'
  })
}
