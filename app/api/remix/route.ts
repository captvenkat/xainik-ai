import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const RemixSchema = z.object({
  parentId: z.string().min(1),
  mode: z.enum(['humor', 'inspiration']),
  creatorName: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RemixSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: parsed.error.issues 
      }, { status: 400 });
    }
    
    const { parentId, mode, creatorName } = parsed.data;

    const sb = supabaseService();

    // Generate new meme text (this would typically call the AI generation)
    // For now, we'll use a placeholder that indicates it's a remix
    const remixLine = `REMIX: ${mode === 'inspiration' ? 'INSPIRATION' : 'HUMOR'} MILITARY SKILL`;

    // Pick a random background (you can expand this list)
    const backgrounds = ['military-01.webp', 'military-02.webp', 'military-03.webp'];
    const bgKey = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    // Generate composed image URL
    const imageUrl = `/api/og?line=${encodeURIComponent(remixLine)}&bg=${bgKey}`;

    // Create new meme with parent reference
    const { data: newMeme, error: insertError } = await sb
      .from('memes')
      .insert({
        id: uuidv4(),
        mode,
        line: remixLine,
        bg_key: bgKey,
        image_url: imageUrl,
        creator_name: creatorName,
        parent_id: parentId,
        likes: 0,
        shares: 0,
        remix_count: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create remix:', insertError);
      return NextResponse.json({ error: 'Failed to create remix' }, { status: 500 });
    }

    // Increment parent's remix count
    const { data: parentMeme, error: fetchError } = await sb
      .from('memes')
      .select('remix_count')
      .eq('id', parentId)
      .single();

    if (!fetchError && parentMeme) {
      const { error: updateError } = await sb
        .from('memes')
        .update({ remix_count: (parentMeme.remix_count || 0) + 1 })
        .eq('id', parentId);

      if (updateError) {
        console.error('Failed to update parent remix count:', updateError);
        // Don't fail the request if this fails
      }
    }

    return NextResponse.json({ 
      ok: true, 
      meme: newMeme,
      message: 'Remix created successfully' 
    });
  } catch (error) {
    console.error('Remix API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
