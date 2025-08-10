import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Xainik',
  description: 'Get in touch with the Xainik team. We\'re here to help veterans and recruiters connect for meaningful career opportunities.',
  openGraph: {
    title: 'Contact Us | Xainik',
    description: 'Get in touch with the Xainik team. We\'re here to help veterans and recruiters connect.',
    url: '/contact',
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
