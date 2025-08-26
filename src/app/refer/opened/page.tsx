'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { CheckCircle, ThumbsUp, ThumbsDown, MessageSquare, User, Mail, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'

function ReferralOpenedPageContent() {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showSupporterForm, setShowSupporterForm] = useState(false)
  const [supporterForm, setSupporterForm] = useState({
    name: '',
    email: '',
    reason: ''
  })
  const [supporterSubmitting, setSupporterSubmitting] = useState(false)
  const [supporterSubmitted, setSupporterSubmitted] = useState(false)
  const [pitchData, setPitchData] = useState<any>(null)
  const [referralData, setReferralData] = useState<any>(null)
  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowser()

  const referralId = searchParams.get('ref')
  const pitchId = searchParams.get('pitch')

  useEffect(() => {
    if (referralId) {
      loadReferralData()
    }
  }, [referralId])

  async function loadReferralData() {
    try {
      // Get referral and pitch data
      const { data: referral } = await supabase
        .from('referrals')
        .select(`
          *,
          pitches (
            id,
            title,
            pitch_text,
            users (
              name
            )
          )
        `)
        .eq('id', referralId as string)
        .single()

      if (referral) {
        setReferralData(referral)
        setPitchData(referral.pitches)
      }
    } catch (error) {
      console.error('Error loading referral data:', error)
    }
  }

  const handleFeedback = async (type: string) => {
    if (!referralId) return

    setIsSubmitting(true)
    
    try {
      // Update tracking event with feedback
      const { error } = await supabase
        .from('tracking_events')
        .update({ 
          metadata: { 
            ...metadata,
            feedback: 'opened',
            feedback_at: new Date().toISOString()
          }
        })
        .eq('id', referralId as string)

      if (error) throw error
      setSubmitted(true)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComment = async () => {
    if (!referralId || !feedback.trim()) return

    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('tracking_events')
        .update({ 
          metadata: { 
            ...metadata,
            feedback: 'opened',
            feedback_at: new Date().toISOString()
          }
        })
        .eq('id', referralId as string)

      if (error) throw error
      setSubmitted(true)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSupporterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supporterForm.name || !supporterForm.email) return

    setSupporterSubmitting(true)

    try {
      // Store supporter data in sessionStorage for the registration flow
      sessionStorage.setItem('supporter_signup_data', JSON.stringify({
        name: supporterForm.name,
        email: supporterForm.email,
        reason: supporterForm.reason,
        referralId: referralId
      }))

      // Redirect to auth with supporter role preselected
      window.location.href = `/auth?role=supporter&redirectTo=/role-selection&email=${encodeURIComponent(supporterForm.email)}&name=${encodeURIComponent(supporterForm.name)}`
      
    } catch (error) {
      console.error('Supporter signup error:', error)
      setSupporterSubmitting(false)
    }
  }

  if (supporterSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Xainik!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for becoming a supporter. You can now help refer veterans to opportunities.
            </p>
            
            <div className="space-y-4">
              <Link 
                href="/dashboard/supporter"
                className="block w-full btn-primary"
              >
                Go to Supporter Dashboard
              </Link>
              <Link 
                href="/browse"
                className="block w-full btn-secondary"
              >
                Browse Veterans
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You for Your Feedback!
            </h1>
            <p className="text-gray-600 mb-8">
              Your feedback helps us improve our platform and better serve veterans.
            </p>
            
            <div className="space-y-4">
              <Link 
                href="/browse"
                className="block w-full btn-primary"
              >
                Browse More Veterans
              </Link>
              <Link 
                href="/"
                className="block w-full btn-secondary"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thanks for Checking Out This Veteran!
            </h1>
            {pitchData && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {pitchData.title}
                </p>
                <p className="text-xs text-blue-700">
                  by {pitchData.users?.name || 'Veteran'}
                </p>
              </div>
            )}
            <p className="text-gray-600">
              We'd love to hear your thoughts about this veteran's pitch.
            </p>
          </div>

          {/* Supporter Signup Section */}
          {!showSupporterForm ? (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-center">
                <Heart className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Help This Veteran Succeed
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Become a supporter and help refer this veteran's pitch to your network. It only takes 30 seconds!
                </p>
                <button
                  onClick={() => setShowSupporterForm(true)}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Yes, I'll Help Refer This Veteran
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <form onSubmit={handleSupporterSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={supporterForm.name}
                    onChange={(e) => setSupporterForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={supporterForm.email}
                    onChange={(e) => setSupporterForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why you want to help (Optional)
                  </label>
                  <textarea
                    value={supporterForm.reason}
                    onChange={(e) => setSupporterForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Share why you want to help veterans find opportunities..."
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={supporterSubmitting || !supporterForm.name || !supporterForm.email}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {supporterSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Become a Supporter
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSupporterForm(false)}
                  className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
                >
                  Maybe later
                </button>
              </form>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Feedback
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleFeedback('positive')}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Good Fit</span>
                </button>
                <button
                  onClick={() => handleFeedback('negative')}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700">Not a Fit</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Comments (Optional)
              </h2>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts about this veteran's skills, experience, or pitch..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleComment}
                disabled={isSubmitting || !feedback.trim()}
                className="mt-3 w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Comment
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <Link 
                  href="/browse"
                  className="block w-full btn-primary"
                >
                  Browse More Veterans
                </Link>
                <Link 
                  href="/"
                  className="block w-full btn-secondary"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
              <p className="text-sm font-medium text-blue-900">Your Feedback Matters</p>
            </div>
            <p className="text-sm text-blue-700">
              Your feedback helps us improve our platform and better match veterans with opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReferralOpenedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ReferralOpenedPageContent />
    </Suspense>
  )
}
