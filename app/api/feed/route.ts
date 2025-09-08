import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Use service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Simple query without filters first
    let query = supabase
      .from('posters')
      .select('*');

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

    // TEMPORARY: Return hardcoded data to get site working
    const hardcodedItems: Poster[] = [
      {
        id: '1',
        slug: 'leadership-under-pressure',
        title_line: 'When everything falls apart, leaders step up',
        contrast_line: 'Experience. Not certificates.',
        image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=1000&fit=crop',
        og_image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=630&fit=crop',
        thumb_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop',
        likes: 42,
        views: 156,
        shares: 8,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        slug: 'teamwork-makes-dreamwork',
        title_line: 'Alone we can do so little; together we can do so much',
        contrast_line: 'Experience. Not certificates.',
        image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop',
        og_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop',
        thumb_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=500&fit=crop',
        likes: 38,
        views: 142,
        shares: 12,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        slug: 'resilience-in-action',
        title_line: 'Fall seven times, stand up eight',
        contrast_line: 'Experience. Not certificates.',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
        og_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop',
        thumb_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
        likes: 55,
        views: 203,
        shares: 15,
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        slug: 'discipline-equals-freedom',
        title_line: 'The pain of discipline or the pain of regret',
        contrast_line: 'Experience. Not certificates.',
        image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=1000&fit=crop',
        og_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=630&fit=crop',
        thumb_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=500&fit=crop',
        likes: 47,
        views: 178,
        shares: 9,
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        slug: 'mentorship-matters',
        title_line: 'Leaders create more leaders',
        contrast_line: 'Experience. Not certificates.',
        image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop',
        og_image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop',
        thumb_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop',
        likes: 61,
        views: 189,
        shares: 18,
        created_at: new Date().toISOString(),
      }
    ];

    const response: FeedResponse = {
      items: hardcodedItems,
      nextCursor: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}