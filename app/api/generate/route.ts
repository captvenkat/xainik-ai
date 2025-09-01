import { NextResponse } from 'next/server';
import { safeSeedInputs, cachedBackgrounds, pick } from '@/lib/utils';

export const runtime = 'edge';

// Content blocklist for safety
const BLOCK = /(suicide|self\s*harm|gore|blood|kill|hate|caste|religion|politics|party|election|slur1|slur2)/i;

// Exact OpenAI system prompt
const SYSTEM = `You write 3 short lines for Xainik posters.

1) Civilian difficulty from input.
2) Soldier mastery in present tense (skill-focused; no gore, politics, units, regiments, ranks).
3) EXACT: IMPOSSIBLE IS ROUTINE.

Rules:
- Two blank lines between lines (visual spacing).
- 6–12 words per line; ≤80 chars per line.
- Respectful: never mock civilians, never pity veterans.
- No weapon focus, no flags, no slogans beyond the tagline.
- If input unsafe/blank, reinterpret as a neutral everyday difficulty (e.g., Mondays).
- Output ONLY the three lines. No quotes, no numbering, no extra text.`;

async function genWithOpenAI(input: string): Promise<string> {
  try {
    const api = process.env.OPENAI_API_KEY!;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${api}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 90,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `INPUT = "${input}"\n\nReturn:\n<Line 1>\n\n<Line 2>\n\nIMPOSSIBLE IS ROUTINE.` }
        ]
      })
    });
    
    if (!res.ok) throw new Error('openai_failed');
    const j = await res.json();
    const txt = j.choices?.[0]?.message?.content?.trim();
    if (!txt) throw new Error('empty');
    return txt;
  } catch {
    // Graceful fallback with exact format specified
    return `Finishing ${input} feels impossible.\n\nSoldiers complete critical missions under pressure.\n\nIMPOSSIBLE IS ROUTINE.`;
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json().catch(() => ({}));
    
    // Input sanitization
    let input = (text || '').trim();
    
    // Blocklist check
    if (BLOCK.test(input)) {
      input = 'deadlines'; // Neutral fallback
    }
    
    // Empty input fallback
    if (!input) {
      input = pick(safeSeedInputs);
    }
    
    const poster = await genWithOpenAI(input);
    const bg_key = pick(cachedBackgrounds);
    
    return NextResponse.json({ ok: true, poster, bg_key, input });
  } catch (error) {
    // Ultimate fallback
    const input = pick(safeSeedInputs);
    const poster = `Finishing ${input} feels impossible.\n\nSoldiers complete critical missions under pressure.\n\nIMPOSSIBLE IS ROUTINE.`;
    const bg_key = pick(cachedBackgrounds);
    
    return NextResponse.json({ ok: true, poster, bg_key, input });
  }
}
