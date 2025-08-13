import Link from 'next/link'
import { Shield, Search, ArrowLeft, CreditCard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/browse"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              Browse Veterans
            </Link>

            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              View Plans
            </Link>
          </div>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Homepage
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link></p>
        </div>
      </div>
    </div>
  )
}
