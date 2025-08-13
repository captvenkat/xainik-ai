'use client'

import Link from 'next/link'
import { ArrowRight, ChevronRight, LogOut } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function SignInTest() {
  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser()
    console.log('SignInTest: Signing out...')
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Sign out successful')
        // Force page reload to clear all state
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Sign out error:', error)
      // Force page reload anyway
      window.location.href = '/'
    }
  }

  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-semibold text-gray-900 mb-2">Auth Test</h3>
      <div className="space-y-2">
        <Link href="/auth" className="block text-blue-600 hover:text-blue-800 text-sm">
          Sign In
        </Link>
        <Link href="/auth" className="block text-green-600 hover:text-green-800 text-sm">
          Get Started
        </Link>
        <button 
          onClick={handleSignOut}
          className="block w-full text-left text-red-600 hover:text-red-800 text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
