import { NextResponse } from 'next/server';
import { MEME_CONFIG } from '@/lib/meme-config';
import { z } from 'zod';

export const runtime = 'edge';

// Content blocklist for safety
const BLOCK = /(suicide|self\s*harm|gore|blood|kill|hate|caste|religion|politics|party|election|slur1|slur2)/i;

const GenerateSchema = z.object({
  mode: z.enum(['humor', 'inspiration']),
  frame: z.string().max(200).optional(),
  enhanced: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = GenerateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: parsed.error.issues 
      }, { status: 400 });
    }
    
    const { mode, frame, enhanced } = parsed.data;

    let line: string;

    if (enhanced && frame) {
      // Enhanced generation with frame guidance
      line = await generateWithFrame(mode as 'humor' | 'inspiration', frame);
    } else {
      // Legacy generation
      line = await generateMemeText(mode as 'humor' | 'inspiration');
    }
    
    return NextResponse.json({ 
      ok: true, 
      line,
      mode 
    });
  } catch (error) {
    console.error('Generate API error:', error);
    
    // Ultimate fallback
    const fallbackMode = 'inspiration' as const;
    const fallbackLine = MEME_CONFIG.safety.fallbackInspiration;
    
    return NextResponse.json({ 
      ok: true, 
      line: fallbackLine,
      mode: fallbackMode
    });
  }
}

async function generateWithFrame(mode: 'humor' | 'inspiration', frame: string): Promise<string> {
  try {
    const systemPrompt = MEME_CONFIG.modes[mode].systemPrompt;
    
    const api = process.env.OPENAI_API_KEY!;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${api}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        max_tokens: 60,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Compose one line around this structure: "${frame}"` }
        ]
      })
    });
    
    if (!res.ok) throw new Error('openai_failed');
    const j = await res.json();
    const txt = j.choices?.[0]?.message?.content?.trim();
    
    if (!txt || txt.length > 100) throw new Error('invalid_response');
    
    // Blocklist check
    if (BLOCK.test(txt)) throw new Error('blocked_content');
    
    return txt;
  } catch (error) {
    console.error('AI generation failed:', error);
    // Return fallback meme
    const fallbacks = mode === 'inspiration' 
      ? [MEME_CONFIG.safety.fallbackInspiration]
      : [MEME_CONFIG.safety.fallbackHumor];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

async function generateMemeText(mode: 'humor' | 'inspiration'): Promise<string> {
  try {
    const systemPrompt = mode === 'inspiration' 
      ? `You write inspirational one-liner memes about the military.
Golden Rule: every line must trigger WOW (admiration, pride).
Rules:
- Start with "THE MILITARY…"
- Present tense, 8–12 words, ALL CAPS.
- Use strong absolutes: always, never, flawless, zero, mission.
- Never demean anyone; never political or violent.
Output only the one line (no quotes).`
      : `You write witty but respectful one-liner memes about the military.
Golden Rule: every line must trigger a SMILE (light admiration).
Rules:
- Start with "THE MILITARY…" OR "IF THE MILITARY…"
- Present tense, 10–14 words, ALL CAPS.
- Short, relatable exaggerations of discipline/focus/teamwork.
- Never demean anyone; never political or violent.
Output only the one line (no quotes).`;

    const api = process.env.OPENAI_API_KEY!;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${api}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 60,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate one military meme line.' }
        ]
      })
    });
    
    if (!res.ok) throw new Error('openai_failed');
    const j = await res.json();
    const txt = j.choices?.[0]?.message?.content?.trim();
    
    if (!txt || txt.length > 100) throw new Error('invalid_response');
    
    // Blocklist check
    if (BLOCK.test(txt)) throw new Error('blocked_content');
    
    return txt;
  } catch (error) {
    console.error('AI generation failed:', error);
    // Return fallback meme
    const fallbacks = mode === 'inspiration' 
      ? [MEME_CONFIG.safety.fallbackInspiration]
      : [MEME_CONFIG.safety.fallbackHumor];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
