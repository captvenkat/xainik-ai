import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
// Force cache refresh for final posters
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

                // Xainik Final Posters with Text Overlays (1024x1024)
                const hardcodedItems: Poster[] = [
                  {
                    id: '1',
                    slug: 'untamed-valor-triumph-amidst-turmoil',
                    title_line: 'Untamed Valor: Triumph Amidst Turmoil',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/untamed-valor-triumph-amidst-turmoil.webp',
                    og_image_url: '/og/untamed-valor-triumph-amidst-turmoil.webp',
                    thumb_url: '/thumbs/untamed-valor-triumph-amidst-turmoil.webp',
                    likes: 94,
                    views: 230,
                    shares: 10,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    slug: 'unbroken-chains-valor-forged-in-fire',
                    title_line: 'Unbroken Chains: Valor Forged in Fire',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/unbroken-chains-valor-forged-in-fire.webp',
                    og_image_url: '/og/unbroken-chains-valor-forged-in-fire.webp',
                    thumb_url: '/thumbs/unbroken-chains-valor-forged-in-fire.webp',
                    likes: 22,
                    views: 189,
                    shares: 30,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '3',
                    slug: 'rising-from-ashes-rallying-against-all-odds',
                    title_line: 'Rising From Ashes: Rallying Against All Odds',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/rising-from-ashes-rallying-against-all-odds.webp',
                    og_image_url: '/og/rising-from-ashes-rallying-against-all-odds.webp',
                    thumb_url: '/thumbs/rising-from-ashes-rallying-against-all-odds.webp',
                    likes: 98,
                    views: 139,
                    shares: 30,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '4',
                    slug: 'unyielding-valor-the-triumph-of-disciplined-excellence',
                    title_line: 'Unyielding Valor: The Triumph of Disciplined Excellence',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/unyielding-valor-the-triumph-of-disciplined-excellence.webp',
                    og_image_url: '/og/unyielding-valor-the-triumph-of-disciplined-excellence.webp',
                    thumb_url: '/thumbs/unyielding-valor-the-triumph-of-disciplined-excellence.webp',
                    likes: 36,
                    views: 170,
                    shares: 27,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '5',
                    slug: 'forging-futures-the-crucible-of-valor',
                    title_line: 'Forging Futures: The Crucible of Valor',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: '/posters/forging-futures-the-crucible-of-valor.webp',
                    og_image_url: '/og/forging-futures-the-crucible-of-valor.webp',
                    thumb_url: '/thumbs/forging-futures-the-crucible-of-valor.webp',
                    likes: 118,
                    views: 140,
                    shares: 34,
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