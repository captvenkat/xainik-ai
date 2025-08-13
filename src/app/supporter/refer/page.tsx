'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Share2, Copy, Eye, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function SupporterReferPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activePitches, setActivePitches] = useState<any[]>([])
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
          router.push('/auth?redirectTo=/supporter/refer')
          return
        }
        
        setUser(user)
        
        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError || profile?.role !== 'supporter') {
          router.push('/dashboard')
          return
        }
        
        setProfile(profile)
        
        // Fetch active pitches
        await fetchActivePitches()
        
      } catch (error) {
        console.error('Supporter refer page error:', error)
        setError('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuthAndLoadData()
  }, [router])

  async function fetchActivePitches() {
    try {
      const supabase = createSupabaseBrowser()
      
      const { data: pitches } = await supabase
        .from('pitches')
        .select(`
          id,
          title,
          pitch_text,
          skills,
          experience_years,
          user:users(
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      setActivePitches(pitches || [])
    } catch (error) {
      console.error('Failed to fetch active pitches:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Refer Page...</h2>
          <p className="text-gray-600">Please wait while we load veteran pitches.</p>
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
            <Share2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Share Veterans</h1>
          </div>
          <p className="text-gray-600">Help veterans find opportunities by sharing their pitches</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {activePitches?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Veterans</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Your Shares</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Total Clicks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Veterans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {activePitches && activePitches.length > 0 ? (
            activePitches.map((pitch) => (
              <div key={pitch.id as string} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {pitch.title as string}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {(pitch.pitch_text as string)?.substring(0, 120)}...
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {(pitch.user as any)?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                                                                    <div className="font-medium text-gray-900">
                        {(pitch.user as any)?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {(pitch.experience_years || 0)} years experience
                      </div>
                    </div>
                  </div>

                  {(pitch.skills as string[]) && (pitch.skills as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(pitch.skills as string[]).slice(0, 3).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {(pitch.skills as string[]).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{(pitch.skills as string[]).length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/pitch/${pitch.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Pitch
                  </Link>
                  <button
                    onClick={() => {
                      const url = `${process.env.NEXT_PUBLIC_SITE_URL}/pitch/${pitch.id}?ref=${user.id}`
                      navigator.clipboard.writeText(url)
                      alert('Referral link copied to clipboard!')
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active veterans</h3>
              <p className="text-gray-600 mb-6">
                Check back later for new veteran pitches to share
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

        {/* How it works */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How Sharing Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find a Veteran</h3>
              <p className="text-sm text-gray-600">
                Browse through active veteran pitches and find someone you'd like to support
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share the Link</h3>
              <p className="text-sm text-gray-600">
                Copy the referral link and share it with your network via social media, email, or messaging
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Impact</h3>
              <p className="text-sm text-gray-600">
                Monitor clicks and engagement on your shared links in your supporter dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
