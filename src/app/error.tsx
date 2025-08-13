'use client'

import Link from 'next/link'
import { Shield, RefreshCw, ArrowLeft, Search, CreditCard } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-red-300 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We&apos;re experiencing technical difficulties. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-gray-100 p-4 rounded-lg mb-4">
              <summary className="cursor-pointer font-medium text-gray-700">Error Details</summary>
              <pre className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

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
          <p>
            Still having issues? <Link href="/contact" className="text-blue-600 hover:underline">Contact support</Link>
          </p>
          <p className="mt-2">
            Error ID: {error.digest || 'unknown'}
          </p>
        </div>
      </div>
    </div>
  )
}
