import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    console.log('[TEST-AUTH] Testing Supabase auth methods...');
    
    const supabase = await createSupabaseServer();
    console.log('[TEST-AUTH] Supabase client created successfully');
    
    // Test if the auth object exists and has the expected methods
    console.log('[TEST-AUTH] Auth object exists:', !!supabase.auth);
    console.log('[TEST-AUTH] Auth methods:', Object.getOwnPropertyNames(supabase.auth));
    
    // Test if exchangeCodeForSession method exists
    const hasExchangeMethod = typeof supabase.auth.exchangeCodeForSession === 'function';
    console.log('[TEST-AUTH] Has exchangeCodeForSession method:', hasExchangeMethod);
    
    if (!hasExchangeMethod) {
      return NextResponse.json({
        success: false,
        error: 'exchangeCodeForSession method not found',
        availableMethods: Object.getOwnPropertyNames(supabase.auth)
      }, { status: 500 });
    }
    
    // Test with a mock code (this will fail but we can see the error)
    console.log('[TEST-AUTH] Testing with mock code...');
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession('mock-code-123');
      console.log('[TEST-AUTH] Mock exchange result:', { data, error });
      
      return NextResponse.json({
        success: true,
        message: 'exchangeCodeForSession method working',
        mockResult: { data: !!data, error: error?.message || 'No error' }
      });
    } catch (exchangeError) {
      console.log('[TEST-AUTH] Mock exchange error:', exchangeError);
      return NextResponse.json({
        success: true,
        message: 'exchangeCodeForSession method exists but failed as expected with mock code',
        mockError: exchangeError instanceof Error ? exchangeError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('[TEST-AUTH] Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
