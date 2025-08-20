'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { FileText, Save, ArrowLeft, AlertCircle, CheckCircle, User, MapPin, Calendar, Phone, Mail, Linkedin, Award, Camera } from 'lucide-react'
import Link from 'next/link'

interface EditPitchFormData {
  title: string
  pitch_text: string
  skills: string[]
  job_type: string
  availability: string
  location: string
  phone: string
  linkedin_url: string
  experience_years: number
  allow_resume_requests: boolean
  resume_share_enabled: boolean
  photo_url: string
}

const JOB_TYPES = [
  'full-time', 'part-time', 'freelance', 'consulting',
  'hybrid', 'project-based', 'remote', 'on-site'
]

const AVAILABILITY_OPTIONS = [
  'Immediate', '30 days', '60 days', '90 days'
]

export default function EditPitchPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [pitch, setPitch] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<EditPitchFormData>({
    title: '',
    pitch_text: '',
    skills: [],
    job_type: '',
    availability: '',
    location: '',
    phone: '',
    linkedin_url: '',
    experience_years: 0,
    allow_resume_requests: false,
    resume_share_enabled: false,
    photo_url: ''
  })
  const router = useRouter()

  const fetchPitchDetails = useCallback(async (userId: string, pitchId: string) => {
    try {
      const supabase = createSupabaseBrowser()
      
      const { data: pitchData, error: pitchError } = await supabase
        .from('pitches')
        .select('*')
        .eq('id', pitchId)
        .eq('user_id', userId)
        .single()

      if (pitchError || !pitchData) {
        router.push('/dashboard/veteran')
        return
      }
      
      setPitch(pitchData)
      
      // Initialize form data with pitch data
      setFormData({
        title: pitchData.title || '',
        pitch_text: pitchData.pitch_text || '',
        skills: pitchData.skills || [],
        job_type: pitchData.job_type || '',
        availability: pitchData.availability || '',
        location: pitchData.location || '',
        phone: pitchData.phone || '',
        linkedin_url: pitchData.linkedin_url || '',
        experience_years: pitchData.experience_years || 0,
        allow_resume_requests: pitchData.allow_resume_requests || false,
        resume_share_enabled: pitchData.resume_share_enabled || false,
        photo_url: pitchData.photo_url || ''
      })
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
          .select('*')
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

  const updateFormData = useCallback((updates: Partial<EditPitchFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSkillsChange = useCallback((value: string) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill)
    updateFormData({ skills: skillsArray })
  }, [updateFormData])

  const validateForm = useCallback(() => {
    const errors = []
    
    if (!formData.title.trim()) errors.push('Title')
    if (!formData.pitch_text.trim()) errors.push('Pitch Description')
    if (formData.skills.length === 0) errors.push('Skills')
    if (!formData.job_type) errors.push('Job Type')
    if (!formData.availability) errors.push('Availability')
    if (!formData.location.trim()) errors.push('Location')
    if (!formData.phone.trim()) errors.push('Phone')
    
    return errors
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createSupabaseBrowser()
      
      if (!user) {
        throw new Error('Authentication required')
      }

      if (!pitch) {
        throw new Error('Pitch data not found')
      }

      // Validate required fields
      const missingFields = validateForm()
      if (missingFields.length > 0) {
        throw new Error(`Please complete the following fields: ${missingFields.join(', ')}`)
      }

      // Update pitch data
      const updateData = {
        title: formData.title.trim(),
        pitch_text: formData.pitch_text.trim(),
        skills: formData.skills.filter(skill => skill.trim()),
        job_type: formData.job_type,
        availability: formData.availability,
        location: formData.location.trim(),
        phone: formData.phone.trim(),
        linkedin_url: formData.linkedin_url.trim(),
        experience_years: formData.experience_years,
        allow_resume_requests: formData.allow_resume_requests,
        resume_share_enabled: formData.resume_share_enabled,
        photo_url: formData.photo_url,
        updated_at: new Date().toISOString()
      }

      const { data: updatedPitch, error: updateError } = await supabase
        .from('pitches')
        .update(updateData)
        .eq('id', pitch.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Pitch update error:', updateError)
        throw new Error('Failed to update pitch')
      }

      setSuccess('Pitch updated successfully!')
      setPitch(updatedPitch)
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard/veteran')
      }, 2000)

    } catch (error: any) {
      console.error('Form submission error:', error)
      setError(error.message || 'Failed to update pitch')
    } finally {
      setIsSaving(false)
    }
  }

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
  if (error && !pitch) {
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

  const missingFields = validateForm()

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

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Experienced Software Engineer with Military Background"
                  required
                />
              </div>

              <div>
                <label htmlFor="pitch_text" className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Description *
                </label>
                <textarea
                  id="pitch_text"
                  rows={4}
                  value={formData.pitch_text}
                  onChange={(e) => updateFormData({ pitch_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Brief overview of your background, skills, and what you're looking for..."
                  required
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  id="skills"
                  value={formData.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., JavaScript, React, Node.js, Leadership"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple skills with commas
                </p>
              </div>
            </div>

            {/* Job Preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Job Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    id="job_type"
                    value={formData.job_type}
                    onChange={(e) => updateFormData({ job_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select job type</option>
                    {JOB_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                    Availability *
                  </label>
                  <select
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => updateFormData({ availability: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select availability</option>
                    {AVAILABILITY_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience_years"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={(e) => updateFormData({ experience_years: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            {/* Contact & Location */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Contact & Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData({ location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Bangalore, India"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData({ phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+91XXXXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => updateFormData({ linkedin_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            {/* Resume Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Resume & Sharing Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allow_resume_requests"
                    checked={formData.allow_resume_requests}
                    onChange={(e) => updateFormData({ allow_resume_requests: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allow_resume_requests" className="ml-2 block text-sm text-gray-700">
                    Allow recruiters to request my resume
                  </label>
                </div>
                <p className="ml-6 text-xs text-gray-500">
                  When enabled, recruiters can click a button to request your resume and add a note explaining why they need it.
                </p>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="resume_share_enabled"
                    checked={formData.resume_share_enabled}
                    onChange={(e) => updateFormData({ resume_share_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="resume_share_enabled" className="ml-2 block text-sm text-gray-700">
                    Enable resume sharing
                  </label>
                </div>
                <p className="ml-6 text-xs text-gray-500">
                  Allow recruiters to view and download your resume directly from your pitch.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving || missingFields.length > 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/dashboard/veteran"
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Link>
            </div>

            {/* Validation Message */}
            {missingFields.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">
                    Please complete all required fields (marked with *) before saving: {missingFields.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Pitch Status Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Pitch Status</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">{pitch.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="font-medium">{new Date(pitch.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium">{pitch.updated_at ? new Date(pitch.updated_at).toLocaleDateString() : 'Never'}</span>
            </div>
            <div className="flex justify-between">
              <span>Views:</span>
              <span className="font-medium">{pitch.views_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Likes:</span>
              <span className="font-medium">{pitch.likes_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Shares:</span>
              <span className="font-medium">{pitch.shares_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
