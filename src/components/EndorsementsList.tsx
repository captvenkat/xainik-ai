"use client"

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { createEndorsement } from '@/lib/actions/endorsements-server'
import { Star, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'

interface Endorsement {
  id: string
  user_id: string
  endorser_user_id: string | null
  text: string
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

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    const checkExistingEndorsement = async () => {
      if (!userId) return
      
      const { data: existingEndorsement } = await supabase
        .from('endorsements')
        .select('id')
        .eq('user_id', pitchId) // Using user_id from pitch
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

      // Get user_id from pitch
      const { data: pitch } = await supabase
        .from('pitches')
        .select('user_id')
        .eq('id', pitchId)
        .single()

      if (!pitch) {
        setError('Pitch not found')
        return
      }

      // Create endorsement
      const result = await createEndorsement(pitch.user_id as string, userId, formData.text.trim())
      
      if (result.error) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setShowForm(false)
      setFormData({ text: '' })
      
      // Refresh the page to show new endorsement
      window.location.reload()
    } catch (error) {
      console.error('Failed to create endorsement:', error)
      setError('Failed to create endorsement. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Endorsements ({endorsements.length})
          </h3>
        </div>
        
        {userId && userRole === 'supporter' && !hasEndorsed && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Add Endorsement
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Endorsement added successfully!</span>
        </div>
      )}

      {/* Endorsement Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="endorsement" className="block text-sm font-medium text-gray-700 mb-2">
                Your Endorsement
              </label>
              <textarea
                id="endorsement"
                value={formData.text}
                onChange={(e) => setFormData({ text: e.target.value })}
                placeholder="Share why you recommend this veteran..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                maxLength={150}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {formData.text.length}/150 characters
                </span>
                {error && (
                  <span className="text-sm text-red-600">{error}</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={pending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    Add Endorsement
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ text: '' })
                  setError('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Endorsements List */}
      <div className="space-y-4">
        {endorsements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No endorsements yet. Be the first to endorse this veteran!</p>
          </div>
        ) : (
          endorsements.map((endorsement) => (
            <div key={endorsement.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{endorsement.text}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Supporter</span>
                    <span>•</span>
                    <span>{new Date(endorsement.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
