import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const maxDuration = 30;

type Poster = {
  id: string;
  slug: string;
  title_line: string;
  contrast_line: string;
  image_url: string;
  og_image_url: string;
  thumb_url: string;
  likes: number;
  views: number;
  shares: number;
  created_at: string;
};

type FeedResponse = {
  items: Poster[];
  nextCursor: string | null;
  version: string;
  timestamp: string;
};

export async function GET() {
  try {
    console.log('🎬 Serving NEW cinematic posters with centered text');

     // Xainik DALL-E 3 Generated Cinematic Posters with New Footer Format (1024x1024)
     const hardcodedItems: Poster[] = [
       {
         id: '1',
         slug: 'made-tough-calls-with-no-clear-answers',
         title_line: 'Made tough calls with no clear answers',
         contrast_line: 'Experience. Not certificates.\nXainik — Natural Leaders',
         image_url: '/posters/made-tough-calls-with-no-clear-answers.webp',
         og_image_url: '/og/made-tough-calls-with-no-clear-answers.webp',
         thumb_url: '/thumbs/made-tough-calls-with-no-clear-answers.webp',
         likes: 94,
         views: 230,
         shares: 10,
         created_at: new Date().toISOString(),
       },
       {
         id: '2',
         slug: 'kept-the-team-moving-in-chaos',
         title_line: 'Kept the team moving in chaos',
         contrast_line: 'Experience. Not certificates.\nXainik — Natural Leaders',
         image_url: '/posters/kept-the-team-moving-in-chaos.webp',
         og_image_url: '/og/kept-the-team-moving-in-chaos.webp',
         thumb_url: '/thumbs/kept-the-team-moving-in-chaos.webp',
         likes: 22,
         views: 189,
         shares: 30,
         created_at: new Date().toISOString(),
       },
       {
         id: '3',
         slug: 'delivered-results-when-everything-changed-overnight',
         title_line: 'Delivered results when everything changed overnight',
         contrast_line: 'Experience. Not certificates.\nXainik — Natural Leaders',
         image_url: '/posters/delivered-results-when-everything-changed-overnight.webp',
         og_image_url: '/og/delivered-results-when-everything-changed-overnight.webp',
         thumb_url: '/thumbs/delivered-results-when-everything-changed-overnight.webp',
         likes: 98,
         views: 139,
         shares: 30,
         created_at: new Date().toISOString(),
       },
       {
         id: '4',
         slug: 'got-the-job-done-with-less-than-enough',
         title_line: 'Got the job done with less than enough',
         contrast_line: 'Experience. Not certificates.\nXainik — Natural Leaders',
         image_url: '/posters/got-the-job-done-with-less-than-enough.webp',
         og_image_url: '/og/got-the-job-done-with-less-than-enough.webp',
         thumb_url: '/thumbs/got-the-job-done-with-less-than-enough.webp',
         likes: 36,
         views: 170,
         shares: 27,
         created_at: new Date().toISOString(),
       },
       {
         id: '5',
         slug: 'stayed-calm-when-everything-else-was-on-fire',
         title_line: 'Stayed calm when everything else was on fire',
         contrast_line: 'Experience. Not certificates.\nXainik — Natural Leaders',
         image_url: '/posters/stayed-calm-when-everything-else-was-on-fire.webp',
         og_image_url: '/og/stayed-calm-when-everything-else-was-on-fire.webp',
         thumb_url: '/thumbs/stayed-calm-when-everything-else-was-on-fire.webp',
         likes: 118,
         views: 140,
         shares: 34,
         created_at: new Date().toISOString(),
       }
     ];

    const response: FeedResponse = {
      items: hardcodedItems,
      nextCursor: null,
      version: "cinematic-v3-new-footer",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
