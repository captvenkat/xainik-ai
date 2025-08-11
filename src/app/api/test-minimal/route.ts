import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[TEST-MINIMAL] Starting minimal test...');
    
    // Test 1: Environment variables
    console.log('[TEST-MINIMAL] Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    });
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Test 2: Try to import Supabase
    console.log('[TEST-MINIMAL] Importing Supabase...');
    let createServerClient;
    try {
      const supabaseModule = await import('@supabase/ssr');
      createServerClient = supabaseModule.createServerClient;
      console.log('[TEST-MINIMAL] Supabase import successful');
    } catch (importError) {
      console.error('[TEST-MINIMAL] Supabase import failed:', importError);
      throw new Error(`Supabase import failed: ${importError}`);
    }
    
    // Test 3: Try to create client
    console.log('[TEST-MINIMAL] Creating Supabase client...');
    let supabase;
    try {
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get: () => undefined,
            set: () => {},
            remove: () => {},
          },
        }
      );
      console.log('[TEST-MINIMAL] Supabase client created successfully');
    } catch (clientError) {
      console.error('[TEST-MINIMAL] Supabase client creation failed:', clientError);
      throw new Error(`Client creation failed: ${clientError}`);
    }
    
    // Test 4: Check if auth object exists
    console.log('[TEST-MINIMAL] Checking auth object...');
    if (!supabase.auth) {
      throw new Error('Auth object not found on Supabase client');
    }
    console.log('[TEST-MINIMAL] Auth object exists');
    
    // Test 5: Check if exchangeCodeForSession method exists
    console.log('[TEST-MINIMAL] Checking exchangeCodeForSession method...');
    if (typeof supabase.auth.exchangeCodeForSession !== 'function') {
      throw new Error('exchangeCodeForSession method not found');
    }
    console.log('[TEST-MINIMAL] exchangeCodeForSession method exists');
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      supabaseVersion: '0.6.1',
      hasAuth: !!supabase.auth,
      hasExchangeMethod: typeof supabase.auth.exchangeCodeForSession === 'function'
    });
    
  } catch (error) {
    console.error('[TEST-MINIMAL] Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
