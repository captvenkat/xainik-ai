'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { FileText, Save, ArrowLeft, AlertCircle, CheckCircle, User, MapPin, Calendar, Phone, Mail, Linkedin, Award, Camera, Briefcase, Info } from 'lucide-react'
import Link from 'next/link'

// EditPitchFormData Interface - Only fields that are actually editable
interface EditPitchFormData {
  title: string
  pitch_text: string
  skills: string[]
  job_type: string
  availability: string
  allow_resume_requests: boolean
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
  // Initialize form data with only editable fields
  const [formData, setFormData] = useState<EditPitchFormData>({
    title: '',
    pitch_text: '',
    skills: [],
    job_type: '',
    availability: '',
    allow_resume_requests: false
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
      
      // Initialize form data with only editable fields
      setFormData({
        title: pitchData.title || '',
        pitch_text: pitchData.pitch_text || '',
        skills: pitchData.skills || [],
        job_type: pitchData.job_type || '',
        availability: pitchData.availability || '',
        allow_resume_requests: pitchData.allow_resume_requests || false
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

  // Update form data with only editable fields
  useEffect(() => {
    if (pitch) {
      setFormData({
        title: pitch.title || '',
        pitch_text: pitch.pitch_text || '',
        skills: pitch.skills || [],
        job_type: pitch.job_type || '',
        availability: pitch.availability || '',
        allow_resume_requests: pitch.allow_resume_requests || false
      })
    }
  }, [pitch])

  const updateFormData = useCallback((updates: Partial<EditPitchFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSkillsChange = useCallback((value: string) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill)
    updateFormData({ skills: skillsArray })
  }, [updateFormData])

  // Form validation - only check editable fields
  const validateForm = useCallback(() => {
    const missingFields: string[] = []
    
    if (!formData.title.trim()) missingFields.push('Title')
    if (!formData.pitch_text.trim()) missingFields.push('Pitch Description')
    if (!formData.skills.length || !formData.skills.some(skill => skill.trim())) missingFields.push('Skills')
    if (!formData.job_type) missingFields.push('Job Type')
    if (!formData.availability) missingFields.push('Availability')
    
    return missingFields
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createSupabaseBrowser()
      
      // Check authentication
      if (!user) {
        throw new Error('Authentication required')
      }

      // Check if pitch exists
      if (!pitch) {
        throw new Error('Pitch not found')
      }

      // Validate form
      const missingFields = validateForm()
      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      }

      // Update only editable fields
      const updateData = {
        title: formData.title.trim(),
        pitch_text: formData.pitch_text.trim(),
        skills: formData.skills.filter(skill => skill.trim()),
        job_type: formData.job_type,
        availability: formData.availability,
        allow_resume_requests: formData.allow_resume_requests,
        updated_at: new Date().toISOString()
      }

      console.log('Updating pitch with data:', updateData)

      const { data: updatedPitch, error: updateError } = await supabase
        .from('pitches')
        .update(updateData)
        .eq('id', pitch.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(`Failed to update pitch: ${updateError.message}`)
      }

      setSuccess('Pitch updated successfully!')
      setPitch(updatedPitch)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard/veteran')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pitch')
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

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Basic Information
            </h3>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your pitch title"
                  required
                />
              </div>

              {/* Pitch Description */}
              <div>
                <label htmlFor="pitch_text" className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pitch_text"
                  value={formData.pitch_text}
                  onChange={(e) => updateFormData({ pitch_text: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your skills, experience, and what you're looking for"
                  required
                />
              </div>

              {/* Skills */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                                  <input
                    type="text"
                    id="skills"
                    value={formData.skills.join(', ')}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter skills separated by commas (e.g., Leadership, Project Management, Team Building)"
                    required
                  />
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple skills with commas
                </p>
              </div>
            </div>
          </div>

          {/* Job Preferences Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Job Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Type */}
              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="job_type"
                  value={formData.job_type}
                  onChange={(e) => updateFormData({ job_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select job type</option>
                  {JOB_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                  Availability <span className="text-red-500">*</span>
                </label>
                <select
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => updateFormData({ availability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select availability</option>
                  {AVAILABILITY_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resume Settings Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Resume Settings
            </h3>
            <div className="space-y-4">
              {/* Allow Resume Requests */}
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
              <p className="text-xs text-gray-500">
                When enabled, recruiters can click a button to request your resume and add a note explaining why they need it.
              </p>
            </div>
          </div>

          {/* Pitch Status Info - Read Only */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-gray-600" />
              Pitch Status (Read Only)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="font-medium text-gray-900">
                  {pitch?.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <div className="font-medium text-gray-900">
                  {pitch?.created_at ? new Date(pitch.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Views:</span>
                <div className="font-medium text-gray-900">{pitch?.views_count || 0}</div>
              </div>
              <div>
                <span className="text-gray-500">Likes:</span>
                <div className="font-medium text-gray-900">{pitch?.likes_count || 0}</div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/dashboard/veteran')}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSaving || missingFields.length > 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

          {/* Validation message */}
          {missingFields.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-800">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">
                  Please complete all required fields (marked with *) before saving.
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
