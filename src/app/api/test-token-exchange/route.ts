import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[TEST-TOKEN] Testing Supabase token exchange endpoint...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    console.log('[TEST-TOKEN] Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      hasSiteUrl: !!siteUrl,
      url: supabaseUrl?.substring(0, 20) + '...',
      siteUrl: siteUrl?.substring(0, 20) + '...',
    });
    
    if (!supabaseUrl || !supabaseKey || !siteUrl) {
      throw new Error('Missing required environment variables');
    }
    
    // Test the token endpoint with a mock request
    const testUrl = `${supabaseUrl}/auth/v1/token?grant_type=authorization_code&code=test_code&redirect_uri=${siteUrl}/auth/callback`;
    
    console.log('[TEST-TOKEN] Testing URL:', testUrl.substring(0, 50) + '...');
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
    });
    
    console.log('[TEST-TOKEN] Response status:', response.status);
    console.log('[TEST-TOKEN] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TEST-TOKEN] Error response:', errorText);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        message: 'Token endpoint test failed'
      }, { status: 500 });
    }
    
    const responseText = await response.text();
    console.log('[TEST-TOKEN] Response body:', responseText);
    
    return NextResponse.json({
      success: true,
      status: response.status,
      message: 'Token endpoint test successful',
      response: responseText
    });
    
  } catch (error) {
    console.error('[TEST-TOKEN] Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
