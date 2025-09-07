import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrSetDeviceId } from '@/lib/cookies';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { posterId } = await request.json();
    
    if (!posterId) {
      return NextResponse.json({ error: 'posterId is required' }, { status: 400 });
    }

    // For now, just return success until database is ready
    return NextResponse.json({ success: true });

    // TODO: Uncomment when database is ready
    /*
    const deviceId = getOrSetDeviceId();

    // Check if like already exists for this device
    const { data: existingLike } = await supabase
      .from('poster_likes')
      .select('id')
      .eq('poster_id', posterId)
      .eq('device_id', deviceId)
      .single();

    if (existingLike) {
      // Like already exists
      return NextResponse.json({ success: true, alreadyLiked: true });
    }

    // Insert new like
    const { error: insertError } = await supabase
      .from('poster_likes')
      .insert({
        poster_id: posterId,
        device_id: deviceId,
      });

    if (insertError) {
      console.error('Error inserting like:', insertError);
      return NextResponse.json({ error: 'Failed to track like' }, { status: 500 });
    }

    // Increment like count
    const { error: updateError } = await supabase
      .rpc('increment_likes', { poster_id: posterId });

    if (updateError) {
      console.error('Error incrementing likes:', updateError);
      return NextResponse.json({ error: 'Failed to increment likes' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    */
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}