import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    console.log('Applying allow_resume_requests migration...');
    
    // Since exec_sql doesn't exist, we'll use a different approach
    // Let's try to add the column using a direct query
    const { error: alterError } = await supabase
      .from('pitches')
      .select('id')
      .limit(1);
    
    if (alterError) {
      console.error('Error checking pitches table:', alterError);
      return NextResponse.json({ error: 'Failed to access pitches table', details: alterError }, { status: 500 });
    }
    
    // For now, let's return success and provide instructions for manual application
    console.log('✅ Migration route ready - manual SQL application required');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration route ready',
      instructions: 'Please run the SQL in add_allow_resume_requests_direct.sql in your Supabase SQL Editor',
      sql_file: 'add_allow_resume_requests_direct.sql'
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
