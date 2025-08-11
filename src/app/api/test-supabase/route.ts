import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    console.log('[TEST] Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    });

    console.log('[TEST] Creating Supabase client...');
    const supabase = await createSupabaseServer();
    
    console.log('[TEST] Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('[TEST] Database connection error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log('[TEST] Connection successful');
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      data: data 
    });

  } catch (error) {
    console.error('[TEST] Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
