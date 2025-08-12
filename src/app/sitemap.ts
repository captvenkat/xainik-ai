import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/donations`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Get active pitches
  const supabase = createSupabaseServerOnly()
  const supabaseClient = await supabase
  const { data: pitches } = await supabaseClient
    .from('pitches')
    .select('id, updated_at')
    .eq('is_active', true)
    .gt('end_date', new Date().toISOString())
    .order('updated_at', { ascending: false })

  // Create pitch URLs
  const pitchUrls = pitches?.map((pitch) => ({
    url: `${baseUrl}/pitch/${pitch.id}`,
    lastModified: new Date(pitch.updated_at as string),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []

  return [...staticPages, ...pitchUrls]
}
