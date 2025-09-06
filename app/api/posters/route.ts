import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ImagePipeline } from '@/lib/image-pipeline';
import { RunwareService } from '@/lib/runware-service';
import { RateLimiter } from '@/lib/rate-limiter';

const Body = z.object({
  speakerId: z.string().min(1),
  photoUrl: z.string().url(),
  userId: z.string().min(1),
  prompt: z.string().max(500).optional(),
  style: z.string().max(100).optional(),
  aspectRatio: z.string().max(20).optional()
});

export async function POST(req: NextRequest) {
  try {
    // Check if Runware is enabled
    if (!RunwareService.isEnabled()) {
      return NextResponse.json({
        error: 'Poster generation is currently disabled',
        code: 'FEATURE_DISABLED'
      }, { status: 503 });
    }

    // Check if API key is configured
    if (!RunwareService.isAvailable()) {
      return NextResponse.json({
        error: 'Poster generation service is not configured',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: parsed.error.issues
      }, { status: 400 });
    }

    const { speakerId, photoUrl, userId, prompt, style, aspectRatio } = parsed.data;

    // Check rate limit
    const rateLimit = await RateLimiter.checkPosterLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        details: {
          limit: 10,
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      }, { status: 429 });
    }

    // Generate poster using Runware
    const runwareResult = await RunwareService.generatePoster({
      photoUrl,
      prompt,
      style,
      aspectRatio
    });

    if (!runwareResult.success) {
      return NextResponse.json({
        error: 'Failed to generate poster',
        message: runwareResult.error
      }, { status: 500 });
    }

    // Process the generated image through our pipeline
    const generatedImageUrl = runwareResult.data!.images[0].url;
    const processedImage = await ImagePipeline.processImage(
      generatedImageUrl,
      speakerId,
      'poster',
      'runware'
    );

    // Record the generation in audit log
    await RateLimiter.recordPosterGeneration(userId, {
      speakerId,
      mediaId: processedImage.mediaId,
      runwareId: runwareResult.data!.id,
      prompt,
      style
    });

    return NextResponse.json({
      ok: true,
      mediaId: processedImage.mediaId,
      urls: processedImage.urls,
      meta: processedImage.meta,
      rateLimit: {
        remaining: rateLimit.remaining - 1,
        resetTime: rateLimit.resetTime
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Poster generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate poster',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
