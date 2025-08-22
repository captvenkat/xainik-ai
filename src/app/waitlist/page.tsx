'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, Clock, Star, CheckCircle, Share2, ArrowRight } from 'lucide-react'
import { generateWaitlistMessage, generatePitchShareUrl } from '@/lib/sharing-messages'

interface WaitlistFormData {
  name: string
  email: string
  service_branch: string
  rank: string
}

export default function WaitlistPage() {
  const [formData, setFormData] = useState<WaitlistFormData>({
    name: '',
    email: '',
    service_branch: '',
    rank: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [totalSignups, setTotalSignups] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Fetch current waitlist stats
    fetchWaitlistStats()
  }, [])

  const fetchWaitlistStats = async () => {
    try {
      const response = await fetch('/api/waitlist/stats')
      if (response.ok) {
        const data = await response.json()
        setTotalSignups(data.totalSignups)
      }
    } catch (error) {
      console.error('Failed to fetch waitlist stats:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setPosition(data.position)
        setTotalSignups(prev => prev + 1)
      } else {
        setError(data.error || 'Failed to join waitlist')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (platform: string) => {
    if (!position) return
    
    const shareText = generateWaitlistMessage(position, platform as 'whatsapp' | 'linkedin' | 'email' | 'twitter' | 'copy')
    const shareUrl = `${window.location.origin}/waitlist?ref=${position}`

    const shareLink = generatePitchShareUrl(platform, shareText, shareUrl)

    window.open(shareLink, '_blank')

    // Track share event
    try {
      await fetch('/api/waitlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, position })
      })
    } catch (error) {
      console.error('Failed to track share:', error)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                You're on the Waitlist! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Welcome to the exclusive community of military veterans
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Position: #{position}
                </h2>
                <p className="text-gray-600">
                  {totalSignups} veterans have joined so far
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">First 50 Get Access</h3>
                  <p className="text-sm text-gray-600">Exclusive early access</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Complete Platform</h3>
                  <p className="text-sm text-gray-600">All features unlocked</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Priority Support</h3>
                  <p className="text-sm text-gray-600">Dedicated assistance</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Move Up the Queue</h3>
                <p className="text-blue-700 mb-4">
                  Share this waitlist to move up 5 positions for each share!
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Twitter
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  We'll notify you when it's your turn to join!
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Back to Homepage
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 text-gray-800 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <Shield className="h-4 w-4" />
            Exclusive Waitlist for Military Veterans
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Join the First 50 Veterans
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get privileged access to the complete platform. First 50 veterans get FREE access with unlimited features.
          </p>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{totalSignups} veterans joined</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Only 50 spots available</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Complete Platform Access</h3>
            <p className="text-gray-600 text-sm">Unlimited pitches, supporters, analytics, and all premium features</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Priority Placement</h3>
            <p className="text-gray-600 text-sm">Top visibility to recruiters and faster job placement</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Exclusive Community</h3>
            <p className="text-gray-600 text-sm">Join the founding members and shape the platform's future</p>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Join the Waitlist
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="service_branch" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Branch *
                </label>
                <select
                  id="service_branch"
                  name="service_branch"
                  value={formData.service_branch}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your service branch</option>
                  <option value="army">Indian Army</option>
                  <option value="navy">Indian Navy</option>
                  <option value="airforce">Indian Air Force</option>
                </select>
              </div>

              <div>
                <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-2">
                  Rank *
                </label>
                <input
                  type="text"
                  id="rank"
                  name="rank"
                  value={formData.rank}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Captain, Major, Colonel"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Joining Waitlist...
                </>
              ) : (
                <>
                  Join Waitlist
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By joining, you agree to receive updates about your waitlist position and platform launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
