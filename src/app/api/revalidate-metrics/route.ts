import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { veteranId } = await request.json();
    
    // Revalidate all metrics
    await Promise.all([
      revalidateTag('metrics-trendline'),
      revalidateTag('metrics-cohorts'),
      revalidateTag('metrics-avg-time'),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revalidating metrics:', error);
    return NextResponse.json({ error: 'Failed to revalidate metrics' }, { status: 500 });
  }
}
