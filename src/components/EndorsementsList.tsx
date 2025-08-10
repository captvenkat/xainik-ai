"use client"

import { useState, useEffect } from 'react'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import { createEndorsement } from '@/lib/actions/endorsements'
import { logActivity } from '@/lib/activity'
import { Star, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'

interface Endorsement {
  id: string
  endorser: {
    name: string
    role: string
  }
  text?: string
  created_at: string
}

interface EndorsementsListProps {
  endorsements: Endorsement[]
  pitchId: string
  userId?: string
  userRole?: string
}

export default function EndorsementsList({ 
  endorsements, 
  pitchId, 
  userId,
  userRole 
}: EndorsementsListProps) {
  const [pending, setPending] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ text: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasEndorsed, setHasEndorsed] = useState(false)

  const supabase = getBrowserSupabase()

  useEffect(() => {
    const checkExistingEndorsement = async () => {
      if (!userId) return
      
      const { data: existingEndorsement } = await supabase
        .from('endorsements')
        .select('id')
        .eq('veteran_id', pitchId) // This should be veteran_id, not pitch_id
        .eq('endorser_id', userId)
        .single()
      
      setHasEndorsed(!!existingEndorsement)
    }

    checkExistingEndorsement()
  }, [pitchId, userId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.text.trim()) {
      setError('Please provide an endorsement message')
      return
    }

    if (formData.text.length > 150) {
      setError('Endorsement message must be 150 characters or less')
      return
    }

    setPending(true)
    setError('')

    try {
      if (!userId) {
        setError('You must be logged in to endorse')
        return
      }

      if (userRole !== 'supporter') {
        setError('Only supporters can endorse veterans')
        return
      }

      // Get veteran_id from pitch
      const { data: pitch } = await supabase
        .from('pitches')
        .select('veteran_id')
        .eq('id', pitchId)
        .single()

      if (!pitch) {
        setError('Pitch not found')
        return
      }

      // Create endorsement
      await createEndorsement(pitch.veteran_id, userId, formData.text.trim())

      // Log activity
      await logActivity('endorsement_added', {
        endorser_id: userId,
        veteran_id: pitch.veteran_id,
        pitch_id: pitchId,
        endorsement_text: formData.text.trim()
      })

      setSuccess(true)
      setFormData({ text: '' })
      setShowForm(false)
      setHasEndorsed(true)

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

      // Refresh the page to show new endorsement
      window.location.reload()

    } catch (err: any) {
      setError(err.message || 'Failed to submit endorsement')
    } finally {
      setPending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ text: e.target.value })
    if (error) setError('')
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="ml-3 text-sm text-green-700">
              Your endorsement has been submitted successfully!
            </p>
          </div>
        </div>
      )}

      {/* Endorsements List */}
      {endorsements.length === 0 ? (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No endorsements yet.</p>
          {userRole === 'supporter' && !hasEndorsed && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 btn-primary"
            >
              Be the first to endorse
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {endorsements.map((endorsement) => (
            <div key={endorsement.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-medium text-gray-800">
                    {endorsement.endorser.name}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(endorsement.created_at).toLocaleDateString()}
                  </span>
                </div>
                {endorsement.text && (
                  <div className="text-sm text-gray-600">{endorsement.text}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Endorsement Form */}
      {showForm && userRole === 'supporter' && !hasEndorsed && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Write Your Endorsement
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="endorsement-text" className="block text-sm font-medium text-gray-700 mb-2">
                Your Endorsement Message (Optional)
              </label>
              <textarea
                id="endorsement-text"
                value={formData.text}
                onChange={handleInputChange}
                rows={3}
                maxLength={150}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share why you recommend this veteran for opportunities..."
              />
              <div className="flex justify-end items-center mt-2">
                <p className="text-sm text-gray-500">
                  {formData.text.length}/150
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={pending}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? 'Submitting...' : 'Submit Endorsement'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ text: '' })
                  setError('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Endorse Button */}
      {!showForm && userRole === 'supporter' && !hasEndorsed && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Endorse This Veteran
        </button>
      )}

      {/* Already Endorsed Message */}
      {hasEndorsed && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-400" />
            <p className="ml-3 text-sm text-blue-700">
              You have already endorsed this veteran.
            </p>
          </div>
        </div>
      )}

      {/* Login Prompt */}
      {!userRole && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Sign in as a supporter to endorse this veteran.
          </p>
          <a href="/auth?redirectTo=/pitch/" className="btn-primary text-sm">
            Sign In
          </a>
        </div>
      )}
    </div>
  )
}
