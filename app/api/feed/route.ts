import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Poster = {
  id: string;
  slug: string;
  title_line: string;
  contrast_line: string;
  image_url: string;
  og_image_url: string;
  thumb_url: string;
  likes: number;
  views: number;
  shares: number;
  created_at: string;
};

type FeedResponse = {
  items: Poster[];
  nextCursor: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'latest';
    const tag = searchParams.get('tag');
    const after = searchParams.get('after');

    // For now, return empty array until database is properly set up
    // This prevents the 500 error and shows the empty state
    const response: FeedResponse = {
      items: [],
      nextCursor: null,
    };

    return NextResponse.json(response);

    // TODO: Uncomment when database is ready
    /*
    let query = supabase
      .from('posters')
      .select('*')
      .eq('is_published', true);

    // Apply tag filter if provided
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Apply sorting
    switch (sort) {
      case 'latest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'trending':
        // Trending = recent likes + views
        query = query.order('likes', { ascending: false }).order('views', { ascending: false });
        break;
      case 'likes':
        query = query.order('likes', { ascending: false });
        break;
      case 'views':
        query = query.order('views', { ascending: false });
        break;
      case 'shares':
        query = query.order('shares', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply cursor pagination
    if (after) {
      query = query.lt('created_at', after);
    }

    // Limit results
    query = query.limit(20);

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch posters' }, { status: 500 });
    }

    // Transform data to match API spec
    const items: Poster[] = (data || []).map((poster: any) => ({
      id: poster.id,
      slug: poster.slug || poster.id,
      title_line: poster.title || poster.title_line || 'Military Experience',
      contrast_line: 'Experience. Not certificates.',
      image_url: poster.image_url || '',
      og_image_url: poster.og_image_url || poster.image_url || '',
      thumb_url: poster.thumb_url || poster.image_url || '',
      likes: poster.likes || 0,
      views: poster.views || 0,
      shares: poster.shares || 0,
      created_at: poster.created_at,
    }));

    // Generate next cursor
    const nextCursor = items.length === 20 ? items[items.length - 1].created_at : null;

    const response: FeedResponse = {
      items,
      nextCursor,
    };

    return NextResponse.json(response);
    */
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}