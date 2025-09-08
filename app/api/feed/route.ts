import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
// Force cache refresh for final posters - Updated paths to /posters/
export const preferredRegion = 'auto';

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

export async function GET() {
  try {
    // For now, use default values to avoid dynamic server usage
    const sort = 'latest';
    const tag = null;
    const after = null;

    // Simple query without filters first
    let query = supabase
      .from('posters')
      .select('*');

    // Apply tag filter if provided
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Apply sorting - using latest for now
    query = query.order('created_at', { ascending: false });

    // Apply cursor pagination
    if (after) {
      query = query.lt('created_at', after);
    }

    // Limit results
    query = query.limit(20);

                // Xainik Cinematic Posters with Centered Text (1024x1024)
                const hardcodedItems: Poster[] = [
                  {
                    id: '1',
                    slug: 'made-decisions-in-zero-visibility',
                    title_line: 'Made decisions in zero visibility',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/made-decisions-in-zero-visibility.webp',
                    og_image_url: '/og/made-decisions-in-zero-visibility.webp',
                    thumb_url: '/thumbs/made-decisions-in-zero-visibility.webp',
                    likes: 94,
                    views: 230,
                    shares: 10,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    slug: 'led-when-failure-wasnt-an-option',
                    title_line: 'Led when failure wasn\'t an option',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/led-when-failure-wasnt-an-option.webp',
                    og_image_url: '/og/led-when-failure-wasnt-an-option.webp',
                    thumb_url: '/thumbs/led-when-failure-wasnt-an-option.webp',
                    likes: 22,
                    views: 189,
                    shares: 30,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '3',
                    slug: 'built-trust-under-fire',
                    title_line: 'Built trust under fire',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/built-trust-under-fire.webp',
                    og_image_url: '/og/built-trust-under-fire.webp',
                    thumb_url: '/thumbs/built-trust-under-fire.webp',
                    likes: 98,
                    views: 139,
                    shares: 30,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '4',
                    slug: 'turned-setbacks-into-comebacks',
                    title_line: 'Turned setbacks into comebacks',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/turned-setbacks-into-comebacks.webp',
                    og_image_url: '/og/turned-setbacks-into-comebacks.webp',
                    thumb_url: '/thumbs/turned-setbacks-into-comebacks.webp',
                    likes: 36,
                    views: 170,
                    shares: 27,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '5',
                    slug: 'adapted-when-the-map-ended',
                    title_line: 'Adapted when the map ended',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/adapted-when-the-map-ended.webp',
                    og_image_url: '/og/adapted-when-the-map-ended.webp',
                    thumb_url: '/thumbs/adapted-when-the-map-ended.webp',
                    likes: 118,
                    views: 140,
                    shares: 34,
                    created_at: new Date().toISOString(),
                  }
                ];

                const response: FeedResponse = {
                  items: hardcodedItems,
                  nextCursor: null,
                  timestamp: new Date().toISOString(), // Force cache refresh
                };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}