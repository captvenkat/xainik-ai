'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EndorsePage() {
  const [pitch, setPitch] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  const params = useParams()
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const pitchId = params.pitchId

  useEffect(() => {
    const fetchPitch = async () => {
      try {
        const { data, error } = await supabase
          .from('pitches')
          .select(`
            id,
            title,
            pitch,
            profiles!inner(full_name, avatar_url)
          `)
          .eq('id', pitchId as string)
          .eq('is_active', true)
          .single()

        if (error) throw error
        setPitch(data)
      } catch (error) {
        setError('Pitch not found or no longer active')
      } finally {
        setIsLoading(false)
      }
    }

    if (pitchId) {
      fetchPitch()
    }
  }, [pitchId, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.message.trim()) {
      setError('Please provide an endorsement message')
      return
    }

    if (formData.message.length < 10) {
      setError('Endorsement message must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { error } = await supabase
        .from('endorsements')
        .insert({
          user_id: pitch.user_id,
          endorser_user_id: user.id,
          text: formData.message.trim(),
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setSuccess(true)
    } catch (error) {
      setError('Failed to submit endorsement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !pitch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pitch Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/browse" className="btn-primary">
            Browse Veterans
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your endorsement has been submitted successfully. It will be reviewed and displayed on the veteran's pitch page.
            </p>
            <div className="space-y-3">
              <Link 
                href={`/pitch/${pitchId}`}
                className="block w-full btn-primary"
              >
                Back to Pitch
              </Link>
              <Link 
                href="/browse"
                className="block w-full btn-secondary"
              >
                Browse More Veterans
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/pitch/${pitchId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pitch
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Endorse This Veteran</h1>
          <p className="text-gray-600 mt-2">
            Share why you recommend this veteran for opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pitch Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">{pitch?.profiles?.full_name}</h3>
                <p className="text-sm text-gray-600">Veteran</p>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">{pitch?.title}</h4>
            <p className="text-gray-600 text-sm line-clamp-6">
              {pitch?.pitch}
            </p>
          </div>

          {/* Endorsement Form */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Write Your Endorsement
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave blank for anonymous endorsement"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="For verification purposes only"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Endorsement Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share why you recommend this veteran for opportunities..."
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Minimum 10 characters
                  </p>
                  <p className="text-sm text-gray-500">
                    {formData.message.length}/500
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || formData.message.length < 10}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Endorsement'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Your endorsement will be reviewed before being displayed. 
                We reserve the right to moderate content to maintain quality and authenticity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
