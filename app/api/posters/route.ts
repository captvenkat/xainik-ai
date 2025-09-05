import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// import runware SDK here when key provided
import { createClient } from '@supabase/supabase-js';

const Body = z.object({
  speakerId: z.string(),
  photoUrl: z.string().url(),
  variants: z.array(z.enum(['hero','square','story'])).default(['hero','square','story'])
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if(!parsed.success) return NextResponse.json({error:'Bad request'}, {status:400});
  const { speakerId, photoUrl, variants } = parsed.data;

  // TODO: Call Runware with variants and photoUrl → get images (buffers/urls)
  // const images = await runwareGenerate({ photoUrl, variants });

  // Save to Supabase Storage with WebP preference
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  // TODO: upload images, return signed URLs, insert into media table kind='poster'

  return NextResponse.json({ ok: true /*, urls*/ }, { status: 200 });
}
