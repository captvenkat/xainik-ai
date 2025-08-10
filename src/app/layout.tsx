import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = {
  title: {
    default: 'Xainik - Veteran Hiring Platform',
    template: '%s | Xainik'
  },
  description: 'Empowering veterans to showcase their military experience and connect with meaningful career opportunities. Post a pitch, get calls. Browse verified veterans with direct contact details.',
  keywords: ['veteran hiring', 'military careers', 'veteran jobs', 'recruitment platform', 'veteran employment'],
  authors: [{ name: 'Xainik Team' }],
  creator: 'Xainik',
  publisher: 'Xainik',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Xainik - Veteran Hiring Platform',
    description: 'Empowering veterans to showcase their military experience and connect with meaningful career opportunities.',
    siteName: 'Xainik',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Xainik - Veteran Hiring Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xainik - Veteran Hiring Platform',
    description: 'Empowering veterans to showcase their military experience and connect with meaningful career opportunities.',
    images: ['/og-image.jpg'],
  },
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com'}${typeof window !== 'undefined' ? window.location.pathname : '/'}`} />
      </head>
      <body>
        <Navigation />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
