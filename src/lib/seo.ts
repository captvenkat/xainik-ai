export interface SEOProps {
  title?: string
  titleTemplate?: string
  defaultTitle?: string
  description?: string
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    url?: string
    type?: string
    siteName?: string
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
    }>
  }
  twitter?: {
    cardType?: string
    handle?: string
    site?: string
  }
  additionalMetaTags?: Array<{
    name: string
    content: string
  }>
}

export const defaultSEO: SEOProps = {
  titleTemplate: '%s | Xainik',
  defaultTitle: 'Xainik - Connecting Military Veterans with Civilian Opportunities',
  description: 'Xainik bridges the gap between military excellence and civilian success. Veterans showcase their skills, recruiters find exceptional talent.',
  canonical: process.env.NEXT_PUBLIC_SITE_URL || '',
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || '',
    siteName: 'Xainik',
    title: 'Xainik - Connecting Military Veterans with Civilian Opportunities',
    description: 'Xainik bridges the gap between military excellence and civilian success. Veterans showcase their skills, recruiters find exceptional talent.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Xainik - Military Veterans Platform',
      },
    ],
  },
  twitter: {
    handle: '@xainik',
    site: '@xainik',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'theme-color',
      content: '#2563eb',
    },
  ],
}

export function getPitchSEO(pitch: {
  title: string
  pitch: string
  photo_url?: string
  veteran_name: string
  skills: string[]
  location_current?: string
}): SEOProps {
  const description = pitch.pitch.length > 300 
    ? pitch.pitch.substring(0, 297) + '...'
    : pitch.pitch

  return {
    title: `${pitch.title} - ${pitch.veteran_name}`,
    description: `${description} | ${pitch.skills.slice(0, 3).join(', ')} | ${pitch.location_current || 'India'}`,
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/pitch/${pitch.title}`,
    openGraph: {
      title: `${pitch.title} - ${pitch.veteran_name}`,
      description: `${description} | ${pitch.skills.slice(0, 3).join(', ')} | ${pitch.location_current || 'India'}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/pitch/${pitch.title}`,
      type: 'profile',
      images: pitch.photo_url ? [
        {
          url: pitch.photo_url,
          width: 400,
          height: 400,
          alt: `${pitch.veteran_name} - ${pitch.title}`,
        },
      ] : [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${pitch.veteran_name} - ${pitch.title}`,
        },
      ],
    },
    twitter: {
      cardType: 'summary_large_image',
    },
  }
}

export function getBrowseSEO(filters?: {
  skills?: string
  city?: string
  availability?: string
  jobType?: string
}): SEOProps {
  let title = 'Browse Veterans'
  let description = 'Discover talented military veterans ready for civilian opportunities'

  if (filters) {
    const filterParts = []
    if (filters.skills) filterParts.push(filters.skills)
    if (filters.city) filterParts.push(filters.city)
    if (filters.availability) filterParts.push(filters.availability)
    if (filters.jobType) filterParts.push(filters.jobType)

    if (filterParts.length > 0) {
      title = `${filterParts.join(', ')} Veterans`
      description = `Find ${filterParts.join(', ')} military veterans ready for civilian opportunities`
    }
  }

  return {
    title,
    description,
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/browse`,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/browse`,
    },
  }
}

export function getPricingSEO(): SEOProps {
  return {
    title: 'Pricing - Simple, Transparent Plans',
    description: 'Choose the plan that works best for your career transition. All plans include full visibility and direct recruiter contact.',
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    openGraph: {
      title: 'Pricing - Simple, Transparent Plans',
      description: 'Choose the plan that works best for your career transition. All plans include full visibility and direct recruiter contact.',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    },
  }
}

export function getDonationsSEO(): SEOProps {
  return {
    title: 'Support Our Mission - Donate to Help Veterans',
    description: 'Your donations help us connect more military veterans with meaningful civilian opportunities. Every contribution makes a difference.',
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/donations`,
    openGraph: {
      title: 'Support Our Mission - Donate to Help Veterans',
      description: 'Your donations help us connect more military veterans with meaningful civilian opportunities. Every contribution makes a difference.',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/donations`,
    },
  }
}
