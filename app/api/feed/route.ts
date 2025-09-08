import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Use service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
};

export async function GET() {
  try {
    // For now, use default values to avoid dynamic server usage
    const sort = 'latest';
    const tag = null;
    const after = null;

    // Simple query without filters first
    let query = supabase
      .from('posters')
      .select('*');

    // Apply tag filter if provided
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Apply sorting - using latest for now
    query = query.order('created_at', { ascending: false });

    // Apply cursor pagination
    if (after) {
      query = query.lt('created_at', after);
    }

    // Limit results
    query = query.limit(20);

                // AI-Generated military leadership posters with DALL-E images
                const hardcodedItems: Poster[] = [
                  {
                    id: '1',
                    slug: 'steadfast-valor-unyielding-leadership-in-the-face-of-adversity',
                    title_line: 'Steadfast Valor: Unyielding Leadership in the Face of Adversity',
                    contrast_line: 'Experience Trumps Rank',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-j2CSKtHk3zvIIOEIWPe3QyCl.png?st=2025-09-08T03%3A00%3A45Z&se=2025-09-08T05%3A00%3A45Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=cc612491-d948-4d2e-9821-2683df3719f5&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T19%3A12%3A14Z&ske=2025-09-08T19%3A12%3A14Z&sks=b&skv=2024-08-04&sig=HSQNTorAEZd0Iu/U6h4Uq4a3ROGRWUHlvkt7FNZV/yQ%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-j2CSKtHk3zvIIOEIWPe3QyCl.png?st=2025-09-08T03%3A00%3A45Z&se=2025-09-08T05%3A00%3A45Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=cc612491-d948-4d2e-9821-2683df3719f5&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T19%3A12%3A14Z&ske=2025-09-08T19%3A12%3A14Z&sks=b&skv=2024-08-04&sig=HSQNTorAEZd0Iu/U6h4Uq4a3ROGRWUHlvkt7FNZV/yQ%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-j2CSKtHk3zvIIOEIWPe3QyCl.png?st=2025-09-08T03%3A00%3A45Z&se=2025-09-08T05%3A00%3A45Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=cc612491-d948-4d2e-9821-2683df3719f5&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T19%3A12%3A14Z&ske=2025-09-08T19%3A12%3A14Z&sks=b&skv=2024-08-04&sig=HSQNTorAEZd0Iu/U6h4Uq4a3ROGRWUHlvkt7FNZV/yQ%3D',
                    likes: 82,
                    views: 240,
                    shares: 28,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    slug: 'in-the-trenches-unity-loyalty-mission-accomplished',
                    title_line: 'In The Trenches: Unity, Loyalty, Mission Accomplished',
                    contrast_line: 'Experience Outranks Everything',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-F4lOWWgHbjVoHZ4kOTpzT5kM.png?st=2025-09-08T03%3A01%3A15Z&se=2025-09-08T05%3A01%3A15Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=ed3ea2f9-5e38-44be-9a1b-7c1e65e4d54f&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T13%3A03%3A41Z&ske=2025-09-08T13%3A03%3A41Z&sks=b&skv=2024-08-04&sig=PrYeZCx9sIjq81zr3C%2B1JHVwOhF7HO7QV4xBJHBn8/Y%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-F4lOWWgHbjVoHZ4kOTpzT5kM.png?st=2025-09-08T03%3A01%3A15Z&se=2025-09-08T05%3A01%3A15Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=ed3ea2f9-5e38-44be-9a1b-7c1e65e4d54f&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T13%3A03%3A41Z&ske=2025-09-08T13%3A03%3A41Z&sks=b&skv=2024-08-04&sig=PrYeZCx9sIjq81zr3C%2B1JHVwOhF7HO7QV4xBJHBn8/Y%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-F4lOWWgHbjVoHZ4kOTpzT5kM.png?st=2025-09-08T03%3A01%3A15Z&se=2025-09-08T05%3A01%3A15Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=ed3ea2f9-5e38-44be-9a1b-7c1e65e4d54f&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T13%3A03%3A41Z&ske=2025-09-08T13%3A03%3A41Z&sks=b&skv=2024-08-04&sig=PrYeZCx9sIjq81zr3C%2B1JHVwOhF7HO7QV4xBJHBn8/Y%3D',
                    likes: 42,
                    views: 164,
                    shares: 27,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '3',
                    slug: 'unyielding-valor-the-backbone-of-military-leadership',
                    title_line: 'Unyielding Valor: The Backbone of Military Leadership',
                    contrast_line: 'Experience Outranks Everything',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-TlhkKTAjF7AZ55DJcn3nXLN3.png?st=2025-09-08T03%3A01%3A42Z&se=2025-09-08T05%3A01%3A42Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=b1a0ae1f-618f-4548-84fd-8b16cacd5485&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T09%3A08%3A20Z&ske=2025-09-08T09%3A08%3A20Z&sks=b&skv=2024-08-04&sig=mc/uW%2BmZ/fxWiRkmzDrAMRU%2BxepMmITcLjGr1k869yQ%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-TlhkKTAjF7AZ55DJcn3nXLN3.png?st=2025-09-08T03%3A01%3A42Z&se=2025-09-08T05%3A01%3A42Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=b1a0ae1f-618f-4548-84fd-8b16cacd5485&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T09%3A08%3A20Z&ske=2025-09-08T09%3A08%3A20Z&sks=b&skv=2024-08-04&sig=mc/uW%2BmZ/fxWiRkmzDrAMRU%2BxepMmITcLjGr1k869yQ%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-TlhkKTAjF7AZ55DJcn3nXLN3.png?st=2025-09-08T03%3A01%3A42Z&se=2025-09-08T05%3A01%3A42Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=b1a0ae1f-618f-4548-84fd-8b16cacd5485&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T09%3A08%3A20Z&ske=2025-09-08T09%3A08%3A20Z&sks=b&skv=2024-08-04&sig=mc/uW%2BmZ/fxWiRkmzDrAMRU%2BxepMmITcLjGr1k869yQ%3D',
                    likes: 81,
                    views: 132,
                    shares: 10,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '4',
                    slug: 'unyielding-discipline-the-foundation-of-supreme-excellence',
                    title_line: 'Unyielding Discipline: The Foundation of Supreme Excellence',
                    contrast_line: 'Battle-Tested, Not Briefcase-Carried',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-2vN3UnV6PqldK3Bcl2Jv4kaD.png?st=2025-09-08T03%3A02%3A10Z&se=2025-09-08T05%3A02%3A10Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T20%3A49%3A42Z&ske=2025-09-08T20%3A49%3A42Z&sks=b&skv=2024-08-04&sig=En6CEN8TftHMpaRXR%2B5ODdIdyhdVKUcrd0uYmzrEwFA%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-2vN3UnV6PqldK3Bcl2Jv4kaD.png?st=2025-09-08T03%3A02%3A10Z&se=2025-09-08T05%3A02%3A10Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T20%3A49%3A42Z&ske=2025-09-08T20%3A49%3A42Z&sks=b&skv=2024-08-04&sig=En6CEN8TftHMpaRXR%2B5ODdIdyhdVKUcrd0uYmzrEwFA%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-2vN3UnV6PqldK3Bcl2Jv4kaD.png?st=2025-09-08T03%3A02%3A10Z&se=2025-09-08T05%3A02%3A10Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-07T20%3A49%3A42Z&ske=2025-09-08T20%3A49%3A42Z&sks=b&skv=2024-08-04&sig=En6CEN8TftHMpaRXR%2B5ODdIdyhdVKUcrd0uYmzrEwFA%3D',
                    likes: 107,
                    views: 123,
                    shares: 15,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '5',
                    slug: 'fostering-courage-character-and-competence-the-military-leadership-legacy',
                    title_line: 'Fostering Courage, Character and Competence - The Military Leadership Legacy',
                    contrast_line: 'Experience: The Unseen Medal',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-xvDPSTRy67VEEV4XCudoHdL7.png?st=2025-09-08T03%3A02%3A39Z&se=2025-09-08T05%3A02%3A39Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T04%3A02%3A39Z&ske=2025-09-09T04%3A02%3A39Z&sks=b&skv=2024-08-04&sig=hfjNyF35AnvxHnYy%2B0i%2BF9hqsVfjrixzqywSE2hQVLY%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-xvDPSTRy67VEEV4XCudoHdL7.png?st=2025-09-08T03%3A02%3A39Z&se=2025-09-08T05%3A02%3A39Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T04%3A02%3A39Z&ske=2025-09-09T04%3A02%3A39Z&sks=b&skv=2024-08-04&sig=hfjNyF35AnvxHnYy%2B0i%2BF9hqsVfjrixzqywSE2hQVLY%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-xvDPSTRy67VEEV4XCudoHdL7.png?st=2025-09-08T03%3A02%3A39Z&se=2025-09-08T05%3A02%3A39Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T04%3A02%3A39Z&ske=2025-09-09T04%3A02%3A39Z&sks=b&skv=2024-08-04&sig=hfjNyF35AnvxHnYy%2B0i%2BF9hqsVfjrixzqywSE2hQVLY%3D',
                    likes: 87,
                    views: 193,
                    shares: 32,
                    created_at: new Date().toISOString(),
                  }
                ];

    const response: FeedResponse = {
      items: hardcodedItems,
      nextCursor: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}