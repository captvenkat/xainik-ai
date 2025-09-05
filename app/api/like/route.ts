import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';
import { z } from 'zod';

const LikeSchema = z.object({
  memeId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LikeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: parsed.error.issues 
      }, { status: 400 });
    }
    
    const { memeId } = parsed.data;

    // Check if this is a temporary meme (not yet published)
    if (memeId.startsWith('meme_')) {
      return NextResponse.json({ 
        ok: true, 
        likes: 0,
        message: 'Meme not yet published to database' 
      });
    }

    const sb = supabaseService();

    // First get current likes count
    const { data: currentMeme, error: fetchError } = await sb
      .from('memes')
      .select('likes')
      .eq('id', memeId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch current likes:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch meme' }, { status: 500 });
    }

    // Increment like count
    const { data, error } = await sb
      .from('memes')
      .update({ likes: (currentMeme.likes || 0) + 1 })
      .eq('id', memeId)
      .select('likes')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      likes: data.likes 
    });
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
