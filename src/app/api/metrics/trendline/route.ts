import { NextRequest, NextResponse } from 'next/server';
import { getCachedTrendline } from '@/lib/metrics-cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window');
    const veteranId = searchParams.get('veteranId');

    // Validate window parameter
    if (!window || !['30', '90'].includes(window)) {
      return NextResponse.json(
        { error: 'Invalid window parameter. Must be 30 or 90.' },
        { status: 400 }
      );
    }

    // Validate veteranId if provided (must be valid UUID format)
    if (veteranId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(veteranId)) {
      return NextResponse.json(
        { error: 'Invalid veteranId parameter. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    const opt = {
      window: parseInt(window) as 30 | 90,
      veteranId: veteranId || undefined,
    };

    const series = await getCachedTrendline();

    return NextResponse.json({ series });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
