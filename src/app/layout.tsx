import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TrackingProvider } from '@/components/TrackingProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Xainik - Veteran Success Foundation',
  description: 'Transform your military experience into civilian success',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrackingProvider>
          {children}
        </TrackingProvider>
      </body>
    </html>
  )
}
