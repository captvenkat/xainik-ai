import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const PublishSchema = z.object({
  memeId: z.string().optional(),
  mode: z.enum(['humor', 'inspiration']),
  line: z.string().min(1).max(200),
  bgKey: z.string().min(1),
  imageUrl: z.string().url(),
  creatorName: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = PublishSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: parsed.error.issues 
      }, { status: 400 });
    }
    
    const { memeId, mode, line, bgKey, imageUrl, creatorName } = parsed.data;

    const sb = supabaseService();

    // Test database connection first
    const { data: testData, error: testError } = await sb
      .from('memes')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({ 
        error: 'Database connection failed. Please check if the memes table exists.',
        details: testError.message 
      }, { status: 500 });
    }

    // Generate a proper UUID for the meme
    const memeUUID = randomUUID();

    // Insert meme into database using the correct column names
    const { data, error } = await sb
      .from('memes')
      .insert({
        id: memeUUID,
        input_text: line, // Required column
        output_l1: line, // Main meme text
        output_l2: '', // Secondary line (empty for now)
        tagline: mode === 'inspiration' ? 'INSPIRATION: IMPOSSIBLE IS ROUTINE.' : 'HUMOR: MILITARY HUMOR.',
        bg_key: bgKey,
        name_label: creatorName,
        theme_id: memeUUID, // Use memeUUID as theme_id for now
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ 
        error: 'Failed to save meme to database',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      id: data.id,
      message: 'Meme published successfully' 
    });
  } catch (error) {
    console.error('Publish API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
