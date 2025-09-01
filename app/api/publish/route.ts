import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { input_text, l1, l2, tagline, bg_key, name_label } = await req.json();
    const sb = supabaseService();
    
    // Generate a random theme for variety
    const theme_id = ["cinema-center","glass-lower","duotone-left","blueprint-top","silhouette-low"][Math.floor(Math.random()*5)];
    
    const { data, error } = await sb.from('memes').insert([{
      input_text,
      output_l1: l1,
      output_l2: l2,
      tagline: tagline || 'IMPOSSIBLE IS ROUTINE.',
      bg_key,
      name_label: name_label?.trim() || 'Anonymous',
      theme_id
    }]).select('id, theme_id').single();
    
    if (error) throw error;
    return NextResponse.json({ ok: true, id: data.id });
  } catch {
    return NextResponse.json({ ok: false, localFallback: true });
  }
}
