import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
    data: [
      {
        id: '1',
        slug: 'test-poster',
        title_line: 'Test Poster - API Working!',
        contrast_line: 'Experience. Not certificates.',
        image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=1000&fit=crop',
        og_image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=630&fit=crop',
        thumb_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop',
        likes: 42,
        views: 156,
        shares: 8,
        created_at: new Date().toISOString(),
      }
    ]
  });
}
