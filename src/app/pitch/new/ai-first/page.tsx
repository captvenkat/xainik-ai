'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import AIPitchHelper from '@/components/AIPitchHelper'
import { Shield, CheckCircle, AlertCircle, User, MapPin, Calendar, Phone, Mail, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface AIPitchFormData {
  // Unique to pitch (not duplicated from profile)
  title: string
  pitch_text: string
  skills: string[]
  job_type: string
  availability: string
  photo_url?: string
  resume_url?: string
  resume_share_enabled: boolean
  web_link?: string  // Changed from linkedin_url to be more generic
}

const JOB_TYPES = [
  'full-time', 'part-time', 'freelance', 'consulting',
  'hybrid', 'project-based', 'remote', 'on-site'
]

const AVAILABILITY_OPTIONS = [
  'Immediate', '30 days', '60 days', '90 days'
]

export default function AIFirstPitchPage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<AIPitchFormData>({
    title: '',
    pitch_text: '',
    skills: ['', '', ''],
    job_type: '',
    availability: '',
    resume_share_enabled: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Auto-populate from profile data
  useEffect(() => {
    if (profile && !formData.title) {
      // Auto-generate title from profile data
      const autoTitle = `${profile.name} - Military Professional`
      setFormData(prev => ({ ...prev, title: autoTitle }))
    }
  }, [profile, formData.title])

  const updateFormData = useCallback((updates: Partial<AIPitchFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createSupabaseBrowser()
      
      if (!user) {
        throw new Error('Authentication required')
      }

      if (!profile) {
        throw new Error('Profile data not found. Please complete your profile first.')
      }

      console.log('Profile data:', JSON.stringify(profile, null, 2))

      // Validate required fields with detailed feedback
      const missingFields = []
      
      if (!formData.title.trim()) {
        missingFields.push('Title')
      }
      if (!formData.pitch_text.trim()) {
        missingFields.push('Pitch Description')
      }
      if (formData.skills.length === 0 || formData.skills.some(skill => !skill.trim())) {
        missingFields.push('Skills')
      }
      if (!formData.job_type) {
        missingFields.push('Job Type')
      }
      if (!formData.availability) {
        missingFields.push('Availability')
      }

      if (missingFields.length > 0) {
        throw new Error(`Please complete the following fields: ${missingFields.join(', ')}`)
      }

      console.log('Form data:', JSON.stringify(formData, null, 2))

      // Check if profile has location (required for pitch creation)
      if (!profile.location) {
        throw new Error('Please add your location in your profile before creating a pitch')
      }

      // Create pitch with profile data auto-populated
      const pitchData = {
        user_id: user.id,
        title: formData.title.trim(),
        pitch_text: formData.pitch_text.trim(),
        skills: formData.skills.filter(skill => skill.trim()),
        job_type: formData.job_type,
        availability: formData.availability,
        location: profile.location, // Use profile location (already validated above)
        photo_url: formData.photo_url,
        resume_url: formData.resume_url,
        resume_share_enabled: formData.resume_share_enabled,
        linkedin_url: formData.web_link, // Keep database field name as linkedin_url for compatibility
        is_active: true
      }

      console.log('Attempting to create pitch with data:', JSON.stringify(pitchData, null, 2))

      const { data: pitch, error: pitchError } = await supabase
        .from('pitches')
        .insert(pitchData)
        .select()
        .single()

      if (pitchError) {
        console.error('Pitch creation error:', JSON.stringify(pitchError, null, 2))
        console.error('Error details:', {
          message: pitchError.message,
          details: pitchError.details,
          hint: pitchError.hint,
          code: pitchError.code
        })
        throw new Error(`Failed to create pitch: ${pitchError.message || pitchError.details || pitchError.hint || 'Unknown error'}`)
      }

      setSuccess('Pitch created successfully!')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard/veteran')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pitch')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <AIStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 1:
        return <DetailsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
      case 2:
        return <ReviewStep formData={formData} profile={profile} onNext={nextStep} onBack={prevStep} isLoading={isLoading} error={error} success={success} />
      default:
        return null
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard/veteran"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Create Your Pitch</h1>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of 3
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['AI Pitch Generation', 'Additional Details', 'Review & Create'].map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

// AI Step Component
function AIStep({ formData, updateFormData, onNext }: any) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Pitch Creation</h2>
        <p className="text-gray-600">Let AI help you create a compelling pitch based on your military experience</p>
      </div>

      <AIPitchHelper 
        formData={formData} 
        updateFormData={updateFormData} 
        onNext={onNext} 
        onBack={() => {}} 
      />
    </div>
  )
}

// Details Step Component
function DetailsStep({ formData, updateFormData, onNext, onBack }: any) {
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    setIsValid(
      formData.job_type && 
      formData.availability
    )
  }, [formData])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Details</h2>
      
      <div className="space-y-6">
        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.job_type}
            onChange={(e) => updateFormData({ job_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select job type</option>
            {JOB_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.availability}
            onChange={(e) => updateFormData({ availability: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select availability</option>
            {AVAILABILITY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Web Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share a Web Link (Optional)
          </label>
          <input
            type="url"
            value={formData.web_link || ''}
            onChange={(e) => updateFormData({ web_link: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile, https://github.com/username, https://youtube.com/channel, or your website"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Can be LinkedIn, GitHub, YouTube, portfolio website, or any professional link
          </p>
        </div>

        {/* Resume Share */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="resume_share"
            checked={formData.resume_share_enabled}
            onChange={(e) => updateFormData({ resume_share_enabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="resume_share" className="ml-2 block text-sm text-gray-700">
            Allow recruiters to request my resume
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// Review Step Component
function ReviewStep({ formData, profile, onNext, onBack, isLoading, error, success }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Pitch</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Profile Information (Auto-filled)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{profile?.name || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{profile?.email || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Pitch Info */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Pitch Information</h3>
          <div className="space-y-4">
            <div>
              <span className="text-gray-600 text-sm">Title:</span>
              <p className="font-medium">{formData.title || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Pitch:</span>
              <p className="mt-1 text-gray-900">{formData.pitch_text || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Skills:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.skills.filter((skill: string) => skill.trim()).map((skill: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {skill}
                  </span>
                ))}
                {formData.skills.filter((skill: string) => skill.trim()).length === 0 && (
                  <span className="text-gray-500 text-sm">No skills set</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Job Type:</span>
                <p className="font-medium">{formData.job_type || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Availability:</span>
                <p className="font-medium">{formData.availability || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Location:</span>
                <p className="font-medium">{profile?.location || 'Not specified'}</p>
              </div>
            </div>
            
            {/* Web Link */}
            {formData.web_link && (
              <div>
                <span className="text-gray-600 text-sm">Web Link:</span>
                <div className="mt-1">
                  <a 
                    href={formData.web_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {formData.web_link}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Pitch
            </>
          )}
        </button>
      </div>
    </div>
  )
}
