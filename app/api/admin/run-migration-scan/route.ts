import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const Body = z.object({
  dry: z.boolean().default(true),
  limit: z.number().int().min(1).max(1000).default(100)
});

export async function POST(req: NextRequest) {
  try {
    // TODO: Add admin role check here
    // For now, we'll allow any authenticated user
    
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: parsed.error.issues
      }, { status: 400 });
    }

    const { dry, limit } = parsed.data;

    // Query legacy media records
    const { data: legacyMedia, error } = await supabase
      .from('media')
      .select('id, speaker_id, kind, url, meta')
      .or('meta->mime.neq.image/webp,meta->sizes.is.null')
      .limit(limit);

    if (error) {
      return NextResponse.json({
        error: 'Failed to query legacy media',
        message: error.message
      }, { status: 500 });
    }

    const count = legacyMedia?.length || 0;
    
    if (dry) {
      return NextResponse.json({
        ok: true,
        message: `Found ${count} legacy media records that would be converted`,
        count,
        dry: true
      });
    }

    // TODO: Implement actual migration here
    // For now, just return the count
    return NextResponse.json({
      ok: true,
      message: `Migration would process ${count} records`,
      count,
      dry: false
    });

  } catch (error) {
    console.error('Migration scan error:', error);
    return NextResponse.json({
      error: 'Migration scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
