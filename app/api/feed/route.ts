import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

                // Authentic military leadership posters generated with AI
                const hardcodedItems: Poster[] = [
                  {
                    id: '1',
                    slug: 'steadfast-command-the-forge-of-battlefront-leadership',
                    title_line: 'Steadfast Command: The Forge of Battlefront Leadership',
                    contrast_line: 'Valor Over Vellum',
                    image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=1000&fit=crop',
                    og_image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=630&fit=crop',
                    thumb_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop',
                    likes: 103,
                    views: 269,
                    shares: 9,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    slug: 'unflinching-valor-unbreakable-bonds-the-cornerstones-of-our-brotherhood',
                    title_line: 'Unflinching Valor, Unbreakable Bonds: The Cornerstones of Our Brotherhood',
                    contrast_line: 'Experience Commands, Not Rank',
                    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop',
                    og_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop',
                    thumb_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=500&fit=crop',
                    likes: 112,
                    views: 209,
                    shares: 23,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '3',
                    slug: 'stand-fast-stand-firm-the-resilient-leader-s-charge',
                    title_line: 'Stand Fast, Stand Firm: The Resilient Leader\'s Charge',
                    contrast_line: 'Valor, Not Velvet',
                    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
                    og_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop',
                    thumb_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
                    likes: 62,
                    views: 170,
                    shares: 18,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '4',
                    slug: 'embracing-discipline-pursuing-excellence-the-military-leader-s-journey',
                    title_line: 'Embracing Discipline, Pursuing Excellence: The Military Leader\'s Journey',
                    contrast_line: 'Valor over Vanity',
                    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=1000&fit=crop',
                    og_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=630&fit=crop',
                    thumb_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=500&fit=crop',
                    likes: 62,
                    views: 151,
                    shares: 18,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '5',
                    slug: 'fostering-courage-discipline-and-dedication-the-pillars-of-military-leadership',
                    title_line: 'Fostering Courage, Discipline, and Dedication: The Pillars of Military Leadership',
                    contrast_line: 'Battlefield Wisdom Over Bookish Knowledge',
                    image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop',
                    og_image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop',
                    thumb_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop',
                    likes: 97,
                    views: 248,
                    shares: 11,
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