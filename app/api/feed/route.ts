import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const tab = searchParams.get('tab') || 'newest';
    const limit = Math.min(Number(searchParams.get('limit') || 30), 60);

    const sb = supabaseService();
    let query = sb
      .from('memes')
      .select('id,input_text,output_l1,output_l2,tagline,bg_key,name_label,likes_count,shares,created_at,theme_id')
      .limit(limit);

    // Apply tab-based ordering
    switch (tab) {
      case 'trending':
        // Trending: combination of likes and recency
        query = query.order('likes_count', { ascending: false })
                    .order('created_at', { ascending: false });
        break;
      case 'most-liked':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'most-shared':
        query = query.order('shares', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return NextResponse.json({ ok: true, items: data || [] });
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json({ ok: true, items: [] }); // fail-safe
  }
}
