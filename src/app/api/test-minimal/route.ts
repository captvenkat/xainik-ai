import { NextResponse } from 'next/server';

export async function GET() {
  try {
    
    // Test 1: Environment variables
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    });
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Test 2: Try to import Supabase
    let createServerClient;
    try {
      const supabaseModule = await import('@supabase/ssr');
      createServerClient = supabaseModule.createServerClient;
    } catch (importError) {
      throw new Error(`Supabase import failed: ${importError}`);
    }
    
    // Test 3: Try to create client
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
    } catch (clientError) {
      throw new Error(`Client creation failed: ${clientError}`);
    }
    
    // Test 4: Check if auth object exists
    if (!supabase.auth) {
      throw new Error('Auth object not found on Supabase client');
    }
    
    // Test 5: Check if exchangeCodeForSession method exists
    if (typeof supabase.auth.exchangeCodeForSession !== 'function') {
      throw new Error('exchangeCodeForSession method not found');
    }
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      supabaseVersion: '0.6.1',
      hasAuth: !!supabase.auth,
      hasExchangeMethod: typeof supabase.auth.exchangeCodeForSession === 'function'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
