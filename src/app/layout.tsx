import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Xainik - Veteran Success Foundation | AI-Powered Veteran Career Platform',
  description: 'Over 5,00,000 retired soldiers are struggling for dignified jobs. They secured us. Now we must secure their future. Support the world\'s first AI-powered platform for veteran career transitions.',
  keywords: 'veterans, career transition, AI, nonprofit, India, military, ex-servicemen, retired soldiers, job placement, career support, military leadership, veteran success, AI platform, career guidance, military skills, civilian jobs, veteran foundation, Sec-8 nonprofit, Indian military, defense personnel, retirement support',
  authors: [{ name: 'Veteran Success Foundation' }],
  creator: 'Veteran Success Foundation',
  publisher: 'Veteran Success Foundation',
  category: 'Nonprofit Organization',
  classification: 'Veteran Support & Career Development',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://xainik.com',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#D4AF37' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://xainik.com',
    siteName: 'Xainik - Veteran Success Foundation',
    title: 'Xainik - Veteran Success Foundation | AI-Powered Veteran Career Platform',
    description: 'Over 5,00,000 retired soldiers are struggling for dignified jobs. They secured us. Now we must secure their future. Support the world\'s first AI-powered platform for veteran career transitions.',
    images: [
      {
        url: 'https://xainik.com/images/og-image-main.jpg',
        width: 1200,
        height: 630,
        alt: 'Xainik - AI-Powered Platform for Veteran Career Success',
        type: 'image/jpeg',
      },
      {
        url: 'https://xainik.com/images/og-image-square.jpg',
        width: 600,
        height: 600,
        alt: 'Xainik - Supporting Indian Military Veterans',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@xainik_veterans',
    creator: '@xainik_veterans',
    title: 'Xainik - Veteran Success Foundation | AI-Powered Veteran Career Platform',
    description: 'Over 5,00,000 retired soldiers are struggling for dignified jobs. They secured us. Now we must secure their future. Support the world\'s first AI-powered platform for veteran career transitions.',
    images: [
      'https://xainik.com/images/twitter-card-main.jpg',
      'https://xainik.com/images/twitter-card-square.jpg',
    ],
  },
  other: {
    // WhatsApp Business API
    'whatsapp-business': 'https://wa.me/919876543210?text=Hi%20Xainik%20team,%20I%20want%20to%20support%20veterans',
    
    // LinkedIn specific
    'linkedin:owner': 'xainik-veteran-success-foundation',
    'linkedin:company': 'xainik-veteran-success-foundation',
    
    // Facebook specific
    'fb:app_id': 'your-facebook-app-id',
    'fb:pages': 'your-facebook-page-id',
    
    // Pinterest specific
    'pinterest:rich_pin': 'true',
    
    // Instagram specific
    'instagram:site': '@xainik_veterans',
    
    // YouTube specific
    'youtube:channel': 'UCxxxxxxxxxxxxxxxxxxxxxxxx',
    
    // Telegram specific
    'telegram:channel': '@xainik_veterans',
    
    // WhatsApp specific
    'whatsapp:number': '+919876543210',
    
    // Business specific
    'business:contact_type': 'customer_service',
    'business:contact_data:street_address': 'Veteran Success Foundation',
    'business:contact_data:locality': 'Mumbai',
    'business:contact_data:postal_code': '400001',
    'business:contact_data:country_name': 'India',
    'business:contact_data:phone_number': '+91-XXXXXXXXXX',
    'business:contact_data:email': 'support@xainik.com',
    
    // Schema.org structured data hints
    'schema:name': 'Xainik - Veteran Success Foundation',
    'schema:description': 'AI-powered platform helping veterans build successful second careers',
    'schema:url': 'https://xainik.com',
    'schema:logo': 'https://xainik.com/images/logo.png',
    'schema:sameAs': [
      'https://www.facebook.com/xainikveterans',
      'https://twitter.com/xainik_veterans',
      'https://www.linkedin.com/company/xainik-veteran-success-foundation',
      'https://www.instagram.com/xainik_veterans',
      'https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxxxx',
    ],
    
    // Additional social platforms
    'quora:company': 'Xainik-Veteran-Success-Foundation',
    'reddit:subreddit': 'r/xainikveterans',
    'discord:server': 'xainikveterans',
    'slack:workspace': 'xainikveterans',
    
    // Mobile app specific
    'mobile-web-app-capable': 'yes',
    'mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-title': 'Xainik Veterans',
    
    // PWA specific
    'theme-color': '#D4AF37',
    'msapplication-TileColor': '#D4AF37',
    'msapplication-config': '/browserconfig.xml',
    
    // Security headers
    'referrer': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    
    // Performance hints
    'dns-prefetch': '//fonts.googleapis.com, //fonts.gstatic.com, //checkout.razorpay.com',
    'preconnect': '//fonts.googleapis.com, //fonts.gstatic.com, //checkout.razorpay.com',
    
    // Accessibility
    'accessibility': 'WCAG 2.1 AA compliant',
    'aria-label': 'Xainik - Veteran Success Foundation - Supporting Indian Military Veterans',
    
    // Localization
    'language': 'en',
    'country': 'IN',
    'region': 'MH',
    'city': 'Mumbai',
    
    // Contact information
    'contact:email': 'support@xainik.com',
    'contact:phone': '+91-XXXXXXXXXX',
    'contact:address': 'Veteran Success Foundation, Mumbai, Maharashtra, India',
    
    // Legal information
    'legal:company': 'Veteran Success Foundation',
    'legal:type': 'Section 8 Nonprofit Company',
    'legal:registration': 'Regn. No: XXXX',
    'legal:address': 'Mumbai, Maharashtra, India',
    'legal:website': 'https://xainik.com',
    
    // Mission statement
    'mission:statement': 'Building the world\'s first AI-powered platform that transforms veteran career transitions from struggle to success.',
    'mission:goal': 'Help 5,00,000+ retired soldiers find dignified jobs through AI-powered career support.',
    'mission:values': 'Leadership, Integrity, Discipline, Teamwork, Innovation, Compassion',
    
    // Impact metrics
    'impact:veterans_served': '5000+',
    'impact:careers_transformed': '1200+',
    'impact:partners': '50+',
    'impact:success_rate': '85%',
    
    // Technology stack
    'tech:platform': 'AI-Powered Web Platform',
    'tech:ai': 'Machine Learning, Natural Language Processing, Predictive Analytics',
    'tech:frontend': 'Next.js 14, React 18, TypeScript, Tailwind CSS',
    'tech:backend': 'Node.js, Supabase, PostgreSQL, Real-time APIs',
    'tech:payments': 'Razorpay Integration',
    
    // Content categories
    'content:type': 'Veteran Support, Career Guidance, AI Technology, Nonprofit',
    'content:audience': 'Military Veterans, Ex-Servicemen, Career Counselors, HR Professionals, Supporters',
    'content:language': 'English, Hindi',
    
    // Social impact
    'social:impact': 'Veteran Employment, Career Transition, Military Leadership, AI Innovation, Social Good',
    'social:sdgs': 'SDG 8: Decent Work and Economic Growth, SDG 4: Quality Education, SDG 10: Reduced Inequalities',
    
    // Funding information
    'funding:type': 'Donations, Grants, Corporate Partnerships',
    'funding:goal': '₹10,00,000 for Phase 1 Development',
    'funding:transparency': '100% Transparent - All documents open for public review',
    'funding:allocation': '50% Tech Build, 30% Operations, 20% Veteran Support',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#D4AF37',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for better SEO and social sharing */}
        <meta name="application-name" content="Xainik Veterans" />
        <meta name="apple-mobile-web-app-title" content="Xainik Veterans" />
        <meta name="msapplication-TileColor" content="#D4AF37" />
        <meta name="msapplication-TileImage" content="/mstile-150x150.svg" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//checkout.razorpay.com" />
        
        {/* Preconnect for critical external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        
        {/* Structured data for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NonProfit",
              "name": "Xainik - Veteran Success Foundation",
              "alternateName": "Xainik",
              "description": "AI-powered platform helping veterans build successful second careers. Sec-8 Nonprofit committed to veteran success.",
              "url": "https://xainik.com",
              "logo": "https://xainik.com/images/logo.png",
              "image": "https://xainik.com/images/og-image-main.jpg",
              "sameAs": [
                "https://www.facebook.com/xainikveterans",
                "https://twitter.com/xainik_veterans",
                "https://www.linkedin.com/company/xainik-veteran-success-foundation",
                "https://www.instagram.com/xainik_veterans"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN",
                "addressRegion": "Maharashtra",
                "addressLocality": "Mumbai",
                "postalCode": "400001"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-XXXXXXXXXX",
                "contactType": "customer service",
                "email": "support@xainik.com",
                "availableLanguage": ["English", "Hindi"]
              },
              "foundingDate": "2024",
              "legalName": "Veteran Success Foundation",
              "taxID": "XXXX",
              "mission": "Building the world's first AI-powered platform that transforms veteran career transitions from struggle to success.",
              "serviceArea": {
                "@type": "Country",
                "name": "India"
              },
              "areaServed": {
                "@type": "Country",
                "name": "India"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Veteran Career Support Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "AI-Powered Career Guidance",
                      "description": "Personalized career transition support using artificial intelligence"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Resume Building",
                      "description": "Military experience to civilian skills translation"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Job Placement Support",
                      "description": "Connecting veterans with meaningful employment opportunities"
                    }
                  }
                ]
              },
              "funding": {
                "@type": "MonetaryAmount",
                "currency": "INR",
                "value": "1000000"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Military Veterans and Ex-Servicemen"
              }
            })
          }}
        />
      </head>
                    <body className="min-h-screen bg-premium-black">
                <Navbar />
                {children}
                <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
              </body>
    </html>
  )
}
