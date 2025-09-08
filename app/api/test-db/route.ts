import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic connection
    const { data, error } = await supabase
      .from('posters')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      dataCount: data?.length || 0,
      sampleData: data?.[0] || null,
      envVars: {
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        supabaseKey: supabaseKey.substring(0, 20) + '...'
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
