import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly()
    
    // Read the SQL script
    const fs = require('fs')
    const path = require('path')
    const sqlScript = fs.readFileSync(path.join(process.cwd(), 'fix_donations_rls.sql'), 'utf8')
    
    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript })
    
    if (error) {
      console.error('Error applying RLS fix:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to apply RLS fix',
          details: error.message 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Donations RLS policies fixed successfully! Anonymous donations are now allowed.'
    })
    
  } catch (error) {
    console.error('Error in fix-donations-rls API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to apply the donations RLS fix',
    instructions: [
      '1. This endpoint applies the RLS fix for anonymous donations',
      '2. It drops the restrictive v_donations_owner policy',
      '3. It creates new policies that allow anonymous donations',
      '4. Use POST method to execute the fix'
    ]
  })
}
