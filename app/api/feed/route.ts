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

                // Xainik Cinematic Military Leadership Posters (Framework-Based)
                const hardcodedItems: Poster[] = [
                  {
                    id: '1',
                    slug: 'untamed-valor-triumph-amidst-turmoil',
                    title_line: 'Untamed Valor: Triumph Amidst Turmoil',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-jmzTSJzL0IqNpsf0eekanOC6.png?st=2025-09-08T03%3A20%3A59Z&se=2025-09-08T05%3A20%3A59Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=f1dafa11-a0c2-4092-91d4-10981fbda051&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T03%3A00%3A28Z&ske=2025-09-09T03%3A00%3A28Z&sks=b&skv=2024-08-04&sig=KRzuJZMcReYbtrgxqDYW2AsdYOs1409N1bx0JBLxDjs%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-jmzTSJzL0IqNpsf0eekanOC6.png?st=2025-09-08T03%3A20%3A59Z&se=2025-09-08T05%3A20%3A59Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=f1dafa11-a0c2-4092-91d4-10981fbda051&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T03%3A00%3A28Z&ske=2025-09-09T03%3A00%3A28Z&sks=b&skv=2024-08-04&sig=KRzuJZMcReYbtrgxqDYW2AsdYOs1409N1bx0JBLxDjs%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-jmzTSJzL0IqNpsf0eekanOC6.png?st=2025-09-08T03%3A20%3A59Z&se=2025-09-08T05%3A20%3A59Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=f1dafa11-a0c2-4092-91d4-10981fbda051&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T03%3A00%3A28Z&ske=2025-09-09T03%3A00%3A28Z&sks=b&skv=2024-08-04&sig=KRzuJZMcReYbtrgxqDYW2AsdYOs1409N1bx0JBLxDjs%3D',
                    likes: 94,
                    views: 230,
                    shares: 10,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    slug: 'unbroken-chains-valor-forged-in-fire',
                    title_line: 'Unbroken Chains: Valor Forged in Fire',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-bkxoSpYm1CAM63hmZq4vfAbZ.png?st=2025-09-08T03%3A21%3A28Z&se=2025-09-08T05%3A21%3A28Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T01%3A52%3A38Z&ske=2025-09-09T01%3A52%3A38Z&sks=b&skv=2024-08-04&sig=PsBP5la3sON50nz9FyeDDBpDlWnZ9WSCJ1AETM0QREo%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-bkxoSpYm1CAM63hmZq4vfAbZ.png?st=2025-09-08T03%3A21%3A28Z&se=2025-09-08T05%3A21%3A28Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T01%3A52%3A38Z&ske=2025-09-09T01%3A52%3A38Z&sks=b&skv=2024-08-04&sig=PsBP5la3sON50nz9FyeDDBpDlWnZ9WSCJ1AETM0QREo%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-bkxoSpYm1CAM63hmZq4vfAbZ.png?st=2025-09-08T03%3A21%3A28Z&se=2025-09-08T05%3A21%3A28Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T01%3A52%3A38Z&ske=2025-09-09T01%3A52%3A38Z&sks=b&skv=2024-08-04&sig=PsBP5la3sON50nz9FyeDDBpDlWnZ9WSCJ1AETM0QREo%3D',
                    likes: 22,
                    views: 189,
                    shares: 30,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '3',
                    slug: 'rising-from-ashes-rallying-against-all-odds',
                    title_line: 'Rising From Ashes: Rallying Against All Odds',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-1slogyH4yLOGeMkmyiJRAYy9.png?st=2025-09-08T03%3A21%3A54Z&se=2025-09-08T05%3A21%3A54Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=77e5a8ec-6bd1-4477-8afc-16703a64f029&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T00%3A08%3A53Z&ske=2025-09-09T00%3A08%3A53Z&sks=b&skv=2024-08-04&sig=OdU3MIRqtyADDEN3n2T97YKnnZWULZ%2BXAQw5b4Kh01o%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-1slogyH4yLOGeMkmyiJRAYy9.png?st=2025-09-08T03%3A21%3A54Z&se=2025-09-08T05%3A21%3A54Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=77e5a8ec-6bd1-4477-8afc-16703a64f029&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T00%3A08%3A53Z&ske=2025-09-09T00%3A08%3A53Z&sks=b&skv=2024-08-04&sig=OdU3MIRqtyADDEN3n2T97YKnnZWULZ%2BXAQw5b4Kh01o%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-1slogyH4yLOGeMkmyiJRAYy9.png?st=2025-09-08T03%3A21%3A54Z&se=2025-09-08T05%3A21%3A54Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=77e5a8ec-6bd1-4477-8afc-16703a64f029&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T00%3A08%3A53Z&ske=2025-09-09T00%3A08%3A53Z&sks=b&skv=2024-08-04&sig=OdU3MIRqtyADDEN3n2T97YKnnZWULZ%2BXAQw5b4Kh01o%3D',
                    likes: 98,
                    views: 139,
                    shares: 30,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '4',
                    slug: 'unyielding-valor-the-triumph-of-disciplined-excellence',
                    title_line: 'Unyielding Valor: The Triumph of Disciplined Excellence',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-IJ9uMXgN3UXlweODe73yIQKm.png?st=2025-09-08T03%3A22%3A24Z&se=2025-09-08T05%3A22%3A24Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=b1a0ae1f-618f-4548-84fd-8b16cacd5485&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T01%3A00%3A12Z&ske=2025-09-09T01%3A00%3A12Z&sks=b&skv=2024-08-04&sig=AEO1mRn0NGqWYWm%2Bl7AieARQLVsBn5e83MYRUAasczM%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-IJ9uMXgN3UXlweODe73yIQKm.png?st=2025-09-08T03%3A22%3A24Z&se=2025-09-08T05%3A22%3A24Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=b1a0ae1f-618f-4548-84fd-8b16cacd5485&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T01%3A00%3A12Z&ske=2025-09-09T01%3A00%3A12Z&sks=b&skv=2024-08-04&sig=AEO1mRn0NGqWYWm%2Bl7AieARQLVsBn5e83MYRUAasczM%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-IJ9uMXgN3UXlweODe73yIQKm.png?st=2025-09-08T03%3A22%3A24Z&se=2025-09-08T05%3A22%3A24Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=b1a0ae1f-618f-4548-84fd-8b16cacd5485&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T01%3A00%3A12Z&ske=2025-09-09T01%3A00%3A12Z&sks=b&skv=2024-08-04&sig=AEO1mRn0NGqWYWm%2Bl7AieARQLVsBn5e83MYRUAasczM%3D',
                    likes: 36,
                    views: 170,
                    shares: 27,
                    created_at: new Date().toISOString(),
                  },
                  {
                    id: '5',
                    slug: 'forging-futures-the-crucible-of-valor',
                    title_line: 'Forging Futures: The Crucible of Valor',
                    contrast_line: 'Experience. Not certificates.',
                    image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-NftmuRkP9pJYUVtdi6sZqtOA.png?st=2025-09-08T03%3A22%3A52Z&se=2025-09-08T05%3A22%3A52Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=77e5a8ec-6bd1-4477-8afc-16703a64f029&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T00%3A56%3A51Z&ske=2025-09-09T00%3A56%3A51Z&sks=b&skv=2024-08-04&sig=S3R5KgA1bbVtILXLWbBWS9KQ7AtGBbfBV1kxeA/ukrI%3D',
                    og_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-NftmuRkP9pJYUVtdi6sZqtOA.png?st=2025-09-08T03%3A22%3A52Z&se=2025-09-08T05%3A22%3A52Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=77e5a8ec-6bd1-4477-8afc-16703a64f029&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T00%3A56%3A51Z&ske=2025-09-09T00%3A56%3A51Z&sks=b&skv=2024-08-04&sig=S3R5KgA1bbVtILXLWbBWS9KQ7AtGBbfBV1kxeA/ukrI%3D',
                    thumb_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-JKViD5LSv9uga52ksn1N0PTc/user-57taEx3RkAhXM603KtLJsngL/img-NftmuRkP9pJYUVtdi6sZqtOA.png?st=2025-09-08T03%3A22%3A52Z&se=2025-09-08T05%3A22%3A52Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=77e5a8ec-6bd1-4477-8afc-16703a64f029&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-08T00%3A56%3A51Z&ske=2025-09-09T00%3A56%3A51Z&sks=b&skv=2024-08-04&sig=S3R5KgA1bbVtILXLWbBWS9KQ7AtGBbfBV1kxeA/ukrI%3D',
                    likes: 118,
                    views: 140,
                    shares: 34,
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