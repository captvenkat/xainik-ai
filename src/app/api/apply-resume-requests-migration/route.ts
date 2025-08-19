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
    
    // Complete migration SQL
    const migrationSQL = `
      -- Add the allow_resume_requests column to pitches table
      ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;
      
      -- Update existing records to have allow_resume_requests = false
      UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;
      
      -- Add comment for documentation
      COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';
      
      -- Create index for better query performance
      CREATE INDEX IF NOT EXISTS idx_pitches_allow_resume_requests ON public.pitches(allow_resume_requests);
    `;
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration error:', error);
      return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
    }
    
    console.log('✅ Migration applied successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'allow_resume_requests migration applied successfully',
      column_added: 'allow_resume_requests',
      table: 'pitches',
      index_created: 'idx_pitches_allow_resume_requests'
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
  }
}
