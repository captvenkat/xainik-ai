import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';
import { z } from 'zod';

const FeedQuerySchema = z.object({
  filter: z.enum(['newest', 'most-liked', 'most-shared', 'most-remixed']).default('newest'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      filter: searchParams.get('filter') || 'newest',
      limit: searchParams.get('limit') || '50',
    };
    
    const parsed = FeedQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: parsed.error.issues 
      }, { status: 400 });
    }
    
    const { filter, limit } = parsed.data;
    
    const sb = supabaseService();
    
    let query = sb
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    switch (filter) {
      case 'most-liked':
        query = query.order('likes', { ascending: false });
        break;
      case 'most-shared':
        query = query.order('shares', { ascending: false });
        break;
      case 'most-remixed':
        query = query.order('remix_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data: memes, error } = await query.limit(limit);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch memes' }, { status: 500 });
    }

    // Transform database columns to expected format
    const transformedMemes = (memes || [])
      .filter(meme => {
        // Only show memes with military backgrounds
        return meme.bg_key && meme.bg_key.startsWith('military-');
      })
      .map(meme => ({
        id: meme.id,
        mode: meme.tagline?.includes('INSPIRATION') ? 'inspiration' : 'humor', // Infer mode from tagline
        line: meme.output_l1 || meme.input_text || 'Military skill unlocked',
        bgKey: meme.bg_key,
        imageUrl: `https://byleslhlkakxnsurzyzt.supabase.co/storage/v1/object/public/backgrounds/military/${meme.bg_key}`,
        creatorName: meme.name_label || 'Supporter of Military',
        likes: meme.likes || 0,
        shares: meme.shares || 0,
        remixCount: meme.remix_count || 0,
        createdAt: meme.created_at,
        parentId: meme.parent_id
      }));

    console.log(`Feed API: Fetched ${transformedMemes.length} memes with filter: ${filter}`);

    return NextResponse.json({ 
      ok: true, 
      memes: transformedMemes,
      filter 
    });
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
