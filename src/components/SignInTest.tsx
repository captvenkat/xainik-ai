'use client'

import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'

export default function SignInTest() {
  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-semibold text-gray-900 mb-2">Sign In Test</h3>
      <div className="space-y-2">
        <Link href="/auth" className="block text-blue-600 hover:text-blue-800 text-sm">
          Sign In
        </Link>
        <Link href="/auth" className="block text-green-600 hover:text-green-800 text-sm">
          Get Started
        </Link>
      </div>
    </div>
  )
}
