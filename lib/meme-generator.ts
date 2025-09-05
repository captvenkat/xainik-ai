import { v4 as uuidv4 } from 'uuid';

export type MemeMode = 'humor' | 'inspiration';

interface GeneratedMeme {
  id: string;
  line: string;
  bgKey: string;
  imageUrl: string;
  mode: MemeMode;
}

// Military background images (1080x1350, footer+QR already included)
// These will be converted from your 40 JPG files to WebP format
const MILITARY_BACKGROUNDS = [
  'military-01.webp', 'military-02.webp', 'military-03.webp', 'military-04.webp', 'military-05.webp',
  'military-06.webp', 'military-07.webp', 'military-08.webp', 'military-09.webp', 'military-10.webp',
  'military-11.webp', 'military-12.webp', 'military-13.webp', 'military-14.webp', 'military-15.webp',
  'military-16.webp', 'military-17.webp', 'military-18.webp', 'military-19.webp', 'military-20.webp',
  'military-21.webp', 'military-22.webp', 'military-23.webp', 'military-24.webp', 'military-25.webp',
  'military-26.webp', 'military-27.webp', 'military-28.webp', 'military-29.webp', 'military-30.webp',
  'military-31.webp', 'military-32.webp', 'military-33.webp', 'military-34.webp', 'military-35.webp',
  'military-36.webp', 'military-37.webp', 'military-38.webp', 'military-39.webp', 'military-40.webp'
];

// Fallback memes if AI fails
const FALLBACK_MEMES = {
  inspiration: [
    'THE MILITARY REPEATS UNTIL FLAWLESS.',
    'THE MILITARY NEVER ACCEPTS MEDIOCRITY.',
    'THE MILITARY TURNS CHALLENGES INTO VICTORIES.',
    'THE MILITARY BUILDS UNBREAKABLE DISCIPLINE.',
    'THE MILITARY ACHIEVES THE IMPOSSIBLE DAILY.'
  ],
  humor: [
    'IF THE MILITARY RAN MEETINGS: 10 MINUTES, NO SLIDES.',
    'THE MILITARY MAKES BED MAKING AN ART FORM.',
    'IF THE MILITARY COOKED: EVERY MEAL WOULD BE PERFECT.',
    'THE MILITARY TURNS LAUNDRY INTO A SCIENCE.',
    'IF THE MILITARY ORGANIZED CLOSETS: MARIE KONDO WOULD CRY.'
  ]
};

export async function generateMeme(mode: MemeMode): Promise<GeneratedMeme> {
  try {
    // Generate meme text via AI
    const line = await generateMemeText(mode);
    
    // Pick random background
    const bgKey = pickRandomBackground();
    
    // Generate composed image
    const imageUrl = await composeMemeImage(line, bgKey);
    
    return {
      id: uuidv4(),
      line,
      bgKey,
      imageUrl,
      mode
    };
  } catch (error) {
    console.error('Meme generation failed:', error);
    
    // Fallback to static meme
    const fallbackLine = pickRandomFallback(mode);
    const bgKey = pickRandomBackground();
    
    return {
      id: uuidv4(),
      line: fallbackLine,
      bgKey,
      imageUrl: `/api/og/fallback?line=${encodeURIComponent(fallbackLine)}&bg=${bgKey}`,
      mode
    };
  }
}

async function generateMemeText(mode: MemeMode): Promise<string> {
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

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });

    if (!response.ok) throw new Error('API call failed');
    
    const data = await response.json();
    return data.line || pickRandomFallback(mode);
  } catch (error) {
    console.error('AI generation failed:', error);
    return pickRandomFallback(mode);
  }
}

function pickRandomBackground(): string {
  return MILITARY_BACKGROUNDS[Math.floor(Math.random() * MILITARY_BACKGROUNDS.length)];
}

function pickRandomFallback(mode: MemeMode): string {
  const fallbacks = FALLBACK_MEMES[mode];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

async function composeMemeImage(line: string, bgKey: string): Promise<string> {
  try {
    // Call the OG image generation API
    const response = await fetch('/api/og', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line, bgKey })
    });

    if (!response.ok) throw new Error('Image composition failed');
    
    const data = await response.json();
    return data.imageUrl || `/api/og/fallback?line=${encodeURIComponent(line)}&bg=${bgKey}`;
  } catch (error) {
    console.error('Image composition failed:', error);
    return `/api/og/fallback?line=${encodeURIComponent(line)}&bg=${bgKey}`;
  }
}
