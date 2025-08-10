import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Xainik - Veteran Hiring Platform',
  description: 'Empowering veterans to showcase their military experience and connect with meaningful career opportunities.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
