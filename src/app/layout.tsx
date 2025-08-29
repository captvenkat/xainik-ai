import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Xainik - Veteran Success Foundation',
  description: 'AI-powered platform helping veterans build successful second careers. Sec-8 Nonprofit committed to veteran success.',
  keywords: 'veterans, career transition, AI, nonprofit, India, military',
  authors: [{ name: 'Veteran Success Foundation' }],
  openGraph: {
    title: 'Xainik - Veteran Success Foundation',
    description: 'AI-powered platform helping veterans build successful second careers.',
    url: 'https://xainik.in',
    siteName: 'Xainik',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xainik - Veteran Success Foundation',
    description: 'AI-powered platform helping veterans build successful second careers.',
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        {children}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </body>
    </html>
  )
}
