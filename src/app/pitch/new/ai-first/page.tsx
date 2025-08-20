'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import AIPitchHelper from '@/components/AIPitchHelper'
import { Shield, CheckCircle, AlertCircle, User, MapPin, Calendar, Phone, Mail, ArrowLeft, Save, FileText } from 'lucide-react'
import Link from 'next/link'
import SmartPhotoManager from '@/components/SmartPhotoManager'

interface AIPitchFormData {
  // Unique to pitch (not duplicated from profile)
  title: string
  pitch_text: string
  skills: string[]
  job_type: string
  availability: string
  photo_url?: string
  allow_resume_requests?: boolean
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
    availability: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Check if profile has required fields for pitch creation
  const hasRequiredProfileFields = profile && profile.location && profile.phone
  const missingProfileFields = []
  if (!profile?.location) missingProfileFields.push('Location')
  if (!profile?.phone) missingProfileFields.push('Phone Number')

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

      // Profile validation is already done upfront, so we can proceed with pitch creation

      // Create pitch with profile data auto-populated
      const pitchData = {
        user_id: user.id,
        title: formData.title.trim(),
        pitch_text: formData.pitch_text.trim(),
        skills: formData.skills.filter(skill => skill.trim()),
        job_type: formData.job_type,
        availability: formData.availability,
        location: profile.location || '', // Use profile location (already validated above)
        phone: profile.phone || '', // Add phone from profile
        photo_url: formData.photo_url || '',
        linkedin_url: '',
        likes_count: 0,
        shares_count: 0,
        views_count: 0,
        endorsements_count: 0,
        plan_tier: '',
        experience_years: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        allow_resume_requests: formData.allow_resume_requests || false,
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
    // Show profile validation step if required fields are missing
    if (!hasRequiredProfileFields) {
      return <ProfileValidationStep profile={profile} missingFields={missingProfileFields} />
    }

    switch (currentStep) {
      case 0:
        return <AIStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 1:
        return <DetailsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} profile={profile} />
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
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of 3
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStep()}
      </div>
    </div>
  )
}

// AI Step Component
function AIStep({ formData, updateFormData, onNext }: any) {
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    // Check if AI has generated the required content
    setIsValid(
      formData.title.trim() && 
      formData.pitch_text.trim() && 
      formData.skills.some(skill => skill.trim())
    )
  }, [formData])

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

      {/* Validation message */}
      {!isValid && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">
              Please use the AI assistant above to generate your pitch title, description, and skills before continuing.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Details Step Component
function DetailsStep({ formData, updateFormData, onNext, onBack, profile }: any) {
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



        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo (Optional)
          </label>
                         <SmartPhotoManager
                 profilePhotoUrl={profile?.avatar_url || profile?.photo_url}
                 pitchPhotoUrl={formData.photo_url}
                 onPhotoChange={(photoUrl) => updateFormData({ photo_url: photoUrl })}
                 className="w-full"
               />
          <p className="mt-1 text-xs text-gray-500">
            Add a professional photo to make your pitch stand out
          </p>
        </div>

        {/* Resume Request */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allow_resume_requests"
            checked={formData.allow_resume_requests || false}
            onChange={(e) => updateFormData({ allow_resume_requests: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="allow_resume_requests" className="ml-2 block text-sm text-gray-700">
            Allow recruiters to request my resume
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          When enabled, recruiters can click a button to request your resume and add a note explaining why they need it.
        </p>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>

        {/* Validation message */}
        {!isValid && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">
                Please complete all required fields (marked with *) before continuing.
              </span>
            </div>
          </div>
        )}
    </div>
  )
}

// Profile Validation Step Component
function ProfileValidationStep({ profile, missingFields }: { profile: any, missingFields: string[] }) {
  const router = useRouter()
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile First</h2>
        <p className="text-gray-600">
          Before creating a pitch, please complete the following required profile information:
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Missing Required Fields:
        </h3>
        <ul className="space-y-2">
          {missingFields.map((field, index) => (
            <li key={index} className="flex items-center text-yellow-800">
              <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
              {field}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Why This Matters:
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            <strong>Location:</strong> Recruiters need to know where you're based for job opportunities
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            <strong>Phone:</strong> Essential for recruiters to contact you directly
          </li>
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push('/dashboard/veteran?tab=profile')}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <User className="w-5 h-5 mr-2" />
          Complete My Profile
        </button>
        <p className="text-sm text-gray-500 mt-3">
          You'll be redirected to your profile tab where you can add the missing information
        </p>
      </div>
    </div>
  )
}

// Review Step Component
function ReviewStep({ formData, profile, onNext, onBack, isLoading, error, success }: any) {
  return (
    <div className="max-w-4xl mx-auto">
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
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Pitch Information</h3>
          <div className="space-y-4">
            
            {/* Photo Preview */}
            {formData.photo_url && (
              <div>
                <span className="text-gray-600 text-sm">Profile Photo:</span>
                <div className="mt-2">
                  <img 
                    src={formData.photo_url} 
                    alt="Profile preview" 
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                </div>
              </div>
            )}
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
            
            {/* Resume Requests */}
            <div>
              <span className="text-gray-600 text-sm">Resume Requests:</span>
              <p className="font-medium">{formData.allow_resume_requests ? 'Enabled' : 'Disabled'}</p>
            </div>
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
