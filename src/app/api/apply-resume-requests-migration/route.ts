import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly();
    
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
    
    // Add the allow_resume_requests column to pitches table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS allow_resume_requests boolean DEFAULT false;
      `
    });
    
    if (alterError) {
      console.error('Error adding column:', alterError);
      return NextResponse.json({ error: 'Failed to add column', details: alterError }, { status: 500 });
    }
    
    // Update existing records to have allow_resume_requests = false
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.pitches SET allow_resume_requests = false WHERE allow_resume_requests IS NULL;
      `
    });
    
    if (updateError) {
      console.error('Error updating existing records:', updateError);
      return NextResponse.json({ error: 'Failed to update records', details: updateError }, { status: 500 });
    }
    
    // Add comment for documentation
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN public.pitches.allow_resume_requests IS 'Whether recruiters can request resume for this pitch';
      `
    });
    
    if (commentError) {
      console.error('Error adding comment:', commentError);
      // Don't fail the migration for this
    }
    
    // Create index for better query performance
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_pitches_allow_resume_requests ON public.pitches(allow_resume_requests);
      `
    });
    
    if (indexError) {
      console.error('Error creating index:', indexError);
      // Don't fail the migration for this
    }
    
    console.log('✅ Migration applied successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'allow_resume_requests migration applied successfully',
      details: {
        columnAdded: true,
        recordsUpdated: true,
        commentAdded: !commentError,
        indexCreated: !indexError
      }
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
  }
}
