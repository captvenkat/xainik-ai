import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const { data: allPosters, error: allError } = await supabase
      .from('posters')
      .select('*')
      .limit(10);

    if (allError) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: allError.message 
      }, { status: 500 });
    }

    // Test published filter
    const { data: publishedPosters, error: publishedError } = await supabase
      .from('posters')
      .select('*')
      .eq('is_published', true)
      .limit(10);

    if (publishedError) {
      return NextResponse.json({ 
        error: 'Published filter failed', 
        details: publishedError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      totalPosters: allPosters?.length || 0,
      publishedPosters: publishedPosters?.length || 0,
      samplePoster: allPosters?.[0] || null,
      samplePublishedPoster: publishedPosters?.[0] || null,
      allPosters: allPosters || [],
      publishedPosters: publishedPosters || []
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
