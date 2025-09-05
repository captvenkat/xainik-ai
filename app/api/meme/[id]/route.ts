import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing meme ID' }, { status: 400 });
    }

    const sb = supabaseService();

    // Fetch meme from database
    const { data: meme, error } = await sb
      .from('memes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !meme) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true, 
      meme: {
        id: meme.id,
        mode: meme.mode,
        line: meme.line,
        bgKey: meme.bg_key,
        imageUrl: meme.image_url,
        creatorName: meme.creator_name,
        likes: meme.likes,
        shares: meme.shares,
        remixCount: meme.remix_count,
        createdAt: meme.created_at,
        parentId: meme.parent_id
      }
    });
  } catch (error) {
    console.error('Meme API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
