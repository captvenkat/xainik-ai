'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Star, Phone, Mail, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ShortlistPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [shortlisted, setShortlisted] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/login?redirect=/shortlist')
          return
        }
        
        setUser(user)
        
        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError || profile?.role !== 'recruiter') {
          router.push('/dashboard')
          return
        }
        
        setProfile(profile)
        
        // Fetch shortlisted pitches
        await fetchShortlistedPitches(user.id)
        
      } catch (error) {
        console.error('Shortlist page error:', error)
        setError('Failed to load shortlist data')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuthAndLoadData()
  }, [router])

  async function fetchShortlistedPitches(userId: string) {
    try {
      const supabase = createSupabaseBrowser()
      
      const { data: shortlistedData } = await supabase
        .from('shared_pitches')
        .select(`
          pitch_id,
          share_link,
          click_count,
          pitch:pitches(
            id,
            title,
            pitch_text,
            skills,
            user:users(
              name,
              email
            )
          )
        `)
        .eq('supporter_id', userId)

      setShortlisted(shortlistedData || [])
    } catch (error) {
      console.error('Failed to fetch shortlisted pitches:', error)
      setError('Failed to load shortlist data')
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Shortlist...</h2>
          <p className="text-gray-600">Please wait while we load your shortlisted veterans.</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Shortlist</h1>
          </div>
          <p className="text-gray-600">Manage your shortlisted veterans and track interactions</p>
        </div>

        {/* Shortlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {shortlisted && shortlisted.length > 0 ? (
            shortlisted.map((item: any) => (
              <div key={item.pitch_id as string} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {(item.pitch as any)?.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {(item.pitch as any)?.pitch_text?.substring(0, 120) || 'No description available'}
                      {(item.pitch as any)?.pitch_text && (item.pitch as any).pitch_text.length > 120 ? '...' : ''}
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                                      <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {(item.pitch as any)?.user?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {(item.pitch as any)?.user?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {(item.pitch as any)?.experience_years || 0} years experience
                        </div>
                      </div>
                    </div>

                  {(item.pitch as any)?.skills && (item.pitch as any).skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                                              {(item.pitch as any).skills.slice(0, 3).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {(item.pitch as any).skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{(item.pitch as any).skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  <a
                    href={`/pitch/${(item.pitch as any)?.id || ''}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Pitch
                  </a>
                </div>

                <div className="flex gap-2">
                  <a
                                          href={`tel:N/A`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                                          href={`mailto:${(item.pitch as any)?.user?.email || ''}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Shortlisted on {new Date(item.created_at as string).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shortlisted veterans</h3>
              <p className="text-gray-600 mb-6">
                Start browsing veterans to build your shortlist
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Veterans
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
