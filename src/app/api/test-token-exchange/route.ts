import { NextResponse } from 'next/server';

export async function GET() {
  try {
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
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
    
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
    });
    
    
    if (!response.ok) {
      const errorText = await response.text();
      
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        message: 'Token endpoint test failed'
      }, { status: 500 });
    }
    
    const responseText = await response.text();
    
    return NextResponse.json({
      success: true,
      status: response.status,
      message: 'Token endpoint test successful',
      response: responseText
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
