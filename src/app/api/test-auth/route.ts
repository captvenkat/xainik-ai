import { NextResponse } from 'next/server';
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly';

export async function GET() {
  try {
    const supabase = await createSupabaseServerOnly();
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Auth error', 
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No user found' 
      }, { status: 401 });
    }
    
    // Test database access
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile error', 
        details: profileError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role,
        created_at: profile?.created_at
      },
      message: 'Authentication successful'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
