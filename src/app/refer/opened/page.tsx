'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import { CheckCircle, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function ReferralOpenedPage() {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const searchParams = useSearchParams()
  const supabase = getBrowserSupabase()

  const referralId = searchParams.get('ref')
  const pitchId = searchParams.get('pitch')

  const handleFeedback = async (type) => {
    if (!referralId) return

    setIsSubmitting(true)
    
    try {
      // Update referral event with feedback
      const { error } = await supabase
        .from('referral_events')
        .update({ 
          feedback: type,
          feedback_at: new Date().toISOString()
        })
        .eq('id', referralId)

      if (error) throw error
      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComment = async () => {
    if (!referralId || !feedback.trim()) return

    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('referral_events')
        .update({ 
          feedback_comment: feedback,
          feedback_at: new Date().toISOString()
        })
        .eq('id', referralId)

      if (error) throw error
      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
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
            <p className="text-gray-600">
              We'd love to hear your thoughts about this veteran's pitch.
            </p>
          </div>

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
