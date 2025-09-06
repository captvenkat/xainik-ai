import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ImagePipeline } from '@/lib/image-pipeline';

const Body = z.object({
  speakerId: z.string().min(1),
  photoUrl: z.string().url(),
  variants: z.array(z.enum(['hero','square','story'])).default(['hero','square','story']),
  source: z.enum(['runware', 'upload']).default('runware')
});

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: parsed.error.issues
      }, { status: 400 });
    }

    const { speakerId, photoUrl, variants, source } = parsed.data;

    // TODO: Call Runware with variants and photoUrl → get images (buffers/urls)
    // For now, we'll process the input photo directly
    // When Runware is integrated, replace photoUrl with the generated poster URLs
    
    const processedImage = await ImagePipeline.processImage(
      photoUrl,
      speakerId,
      'poster',
      source
    );

    return NextResponse.json({
      ok: true,
      mediaId: processedImage.mediaId,
      urls: processedImage.urls,
      meta: processedImage.meta
    }, { status: 200 });

  } catch (error) {
    console.error('Poster generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate poster',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
