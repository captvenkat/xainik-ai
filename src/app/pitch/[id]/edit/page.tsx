'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { FileText, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditPitchPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [pitch, setPitch] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchPitchDetails = useCallback(async (userId: string, pitchId: string) => {
    try {
      const supabase = createSupabaseBrowser()
      
      const { data: pitchData, error: pitchError } = await supabase
        .from('pitches')
        .select('*')
        .eq('id', pitchId)
        .eq('veteran_id', userId)
        .single()

      if (pitchError || !pitchData) {
        router.push('/dashboard/veteran')
        return
      }
      
      setPitch(pitchData)
    } catch (error) {
      console.error('Failed to fetch pitch details:', error)
      setError('Failed to load pitch data')
    }
  }, [router])

  useEffect(() => {
    async function initializePage() {
      try {
        const { id: pitchId } = await params
        setId(pitchId)
        
        const supabase = createSupabaseBrowser()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/login?redirect=/pitch/' + pitchId + '/edit')
          return
        }
        
        setUser(user)
        
        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError || profile?.role !== 'veteran') {
          router.push('/dashboard')
          return
        }
        
        setProfile(profile)
        
        // Fetch pitch details
        await fetchPitchDetails(user.id, pitchId)
        
      } catch (error) {
        console.error('Edit pitch page error:', error)
        setError('Failed to load pitch data')
      } finally {
        setIsLoading(false)
      }
    }
    
    initializePage()
  }, [params, router, fetchPitchDetails])



  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Pitch Editor...</h2>
          <p className="text-gray-600">Please wait while we load your pitch data.</p>
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

  // Show loading state if pitch not loaded yet
  if (!pitch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Pitch...</h2>
          <p className="text-gray-600">Please wait while we load your pitch details.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/veteran"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Edit Pitch</h1>
          </div>
          <p className="text-gray-600">Update your pitch details and information</p>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Pitch Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={pitch.title as string}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Experienced Software Engineer with Military Background"
              />
            </div>

            <div>
              <label htmlFor="pitch_text" className="block text-sm font-medium text-gray-700 mb-2">
                Pitch Text
              </label>
              <textarea
                id="pitch_text"
                name="pitch_text"
                rows={4}
                defaultValue={pitch.pitch_text as string}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief overview of your background, skills, and what you're looking for..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  id="job_type"
                  name="job_type"
                  defaultValue="full-time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="freelance">Freelance</option>
                  <option value="consulting">Consulting</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="project-based">Project-based</option>
                  <option value="remote">Remote</option>
                  <option value="on-site">On-site</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  defaultValue=""
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Bangalore, India"
                />
              </div>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                defaultValue={(pitch.skills as string[])?.join(', ') || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., JavaScript, React, Node.js, Leadership"
              />
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                id="availability"
                name="availability"
                defaultValue="immediate"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="immediate">Immediate</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
              <Link
                href="/dashboard/veteran"
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Status Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Pitch Status</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">Basic Plan</span>
            </div>
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="font-medium">Yes</span>
            </div>
            {/* Subscription expiry info removed - not available in current schema */}
          </div>
        </div>
      </div>
    </div>
  )
}
