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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if view already exists for this device today
    const { data: existingView } = await supabase
      .from('poster_views')
      .select('id')
      .eq('poster_id', posterId)
      .eq('device_id', deviceId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .single();

    if (existingView) {
      // View already tracked for today
      return NextResponse.json({ success: true, alreadyTracked: true });
    }

    // Insert new view
    const { error: insertError } = await supabase
      .from('poster_views')
      .insert({
        poster_id: posterId,
        device_id: deviceId,
      });

    if (insertError) {
      console.error('Error inserting view:', insertError);
      return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
    }

    // Increment view count
    const { error: updateError } = await supabase
      .rpc('increment_views', { poster_id: posterId });

    if (updateError) {
      console.error('Error incrementing views:', updateError);
      return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    */
  } catch (error) {
    console.error('View API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
