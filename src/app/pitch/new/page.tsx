'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import AIPitchHelper from '@/components/AIPitchHelper'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import PhotoUpload from '@/components/PhotoUpload'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'

interface FormData {
  job_type: string
  location_current: string
  location_preferred: string[]
  availability: string
  phone: string
  photo_url?: string
  title: string
  pitch: string
  skills: string[]
  linkedin_url?: string
  resume_file?: File
  manual_summary?: string
}

const JOB_TYPES = [
  'full-time', 'part-time', 'freelance', 'consulting',
  'hybrid', 'project-based', 'remote', 'on-site'
]

const AVAILABILITY_OPTIONS = [
  'Immediate', '30 days', '60 days', '90 days'
]

export default function NewPitchPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    job_type: '',
    location_current: '',
    location_preferred: [],
    availability: '',
    phone: '',
    photo_url: '',
    title: '',
    pitch: '',
    skills: ['', '', '']
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const supabase = createSupabaseBrowser()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      // Debug photo URL before pitch creation
      console.log('Pitch Creation Photo Debug:', {
        formData_photo_url: formData.photo_url,
        formData_photo_url_type: typeof formData.photo_url,
        formData_photo_url_truthy: !!formData.photo_url,
        formData_keys: Object.keys(formData),
        full_formData: formData
      })

      // Validate required fields
      if (!formData.title.trim() || !formData.pitch.trim() || formData.skills.some(skill => !skill.trim())) {
        throw new Error('Please complete all required fields')
      }

      // Create pitch using live schema
      const { data: pitch, error: pitchError } = await supabase
        .from('pitches')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          pitch_text: formData.pitch.trim(),
          skills: formData.skills.map(skill => skill.trim()),
          job_type: formData.job_type,
          location: formData.location_current || '',
          availability: formData.availability || '',
          phone: formData.phone || '',
          linkedin_url: formData.linkedin_url || '',
          photo_url: formData.photo_url || null,
          resume_url: null,
          resume_share_enabled: false,
          plan_tier: '',
          plan_expires_at: null,
          is_active: true,
          likes_count: 0,
          views_count: 0,
          shares_count: 0,
          endorsements_count: 0,
          experience_years: 0,
          allow_resume_requests: false
        })
        .select()
        .single()

      if (pitchError) {
        throw new Error('Failed to create pitch')
      }

      // Redirect to veteran dashboard analytics tab to show smart share options
      router.push(`/dashboard/veteran?tab=analytics&created=true`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pitch')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
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
        return <Step0Basics formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 1:
        return <AIPitchHelper formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
      case 2:
        return <Step2Review formData={formData} onNext={nextStep} onBack={prevStep} />
      case 3:
        return <Step3Submit isLoading={isLoading} error={error} onBack={prevStep} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Pitch</h1>
          <p className="text-gray-600">Showcase your military experience to potential employers</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Basic Info', 'AI Pitch Helper', 'Review', 'Submit'].map((step, index) => (
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
                {index < 3 && (
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

// Step Components will be implemented next...
function Step0Basics({ formData, updateFormData, onNext }: any) {
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    setIsValid(
      formData.job_type && 
      formData.location_current && 
      formData.availability && 
      formData.phone
    )
  }, [formData])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
      
      <div className="space-y-6">
        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type *
          </label>
          <select
            value={formData.job_type}
            onChange={(e) => updateFormData({ job_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select job type</option>
            {JOB_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Current Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Location *
          </label>
          <LocationAutocomplete
            value={formData.location_current}
            onChange={(value) => updateFormData({ location_current: value })}
            placeholder="Enter your current city"
          />
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Locations (up to 3)
          </label>
          <input
            type="text"
            value={formData.location_preferred.join(', ')}
            onChange={(e) => updateFormData({ 
              location_preferred: e.target.value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
            })}
            placeholder="Enter preferred cities, separated by commas"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability *
          </label>
          <select
            value={formData.availability}
            onChange={(e) => updateFormData({ availability: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select availability</option>
            {AVAILABILITY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <PhotoUpload
            profilePhotoUrl={null}
            onPhotoChange={(photoUrl, isCustom) => updateFormData({ photo_url: photoUrl })}
            size="md"
            showCrop={true}
            disabled={false}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 mt-2">
            Upload a professional photo to make your pitch stand out
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: AI Pitch Helper
        </button>
      </div>
    </div>
  )
}

function Step2Review({ formData, onNext, onBack }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Pitch</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pitch Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-gray-900">{formData.title || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Description</label>
              <p className="text-gray-900">{formData.pitch || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex gap-2">
                {formData.skills.map((skill: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill || `Skill ${index + 1}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <p className="text-gray-900">{formData.job_type || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
              <p className="text-gray-900">{formData.location_current || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <p className="text-gray-900">{formData.availability || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
            </div>
          </div>

          {formData.location_preferred.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
              <p className="text-gray-900">{formData.location_preferred.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Create Pitch
        </button>
      </div>
    </div>
  )
}

function Step3Submit({ isLoading, error, onBack }: any) {
  return (
    <div className="text-center">
      {isLoading ? (
        <div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Pitch...</h2>
          <p className="text-gray-600">Please wait while we save your pitch to the platform.</p>
        </div>
      ) : error ? (
        <div>
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Creating Pitch</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go Back & Fix
          </button>
        </div>
      ) : (
        <div>
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pitch Created Successfully!</h2>
          <p className="text-gray-600">Your pitch has been created and is now live on the platform.</p>
        </div>
      )}
    </div>
  )
}

function Step3Plan({ formData, onNext, onBack }: any) {
  const plans = [
    { id: 'trial_14', name: '14-Day Trial', price: '₹1', duration: '14 days', description: 'Perfect for testing the platform' },
    { id: 'plan_30', name: '30-Day Plan', price: '₹299', duration: '30 days', description: 'Most popular choice' },
    { id: 'plan_60', name: '60-Day Plan', price: '₹499', duration: '60 days', description: 'Better value for longer searches' },
    { id: 'plan_90', name: '90-Day Plan', price: '₹599', duration: '90 days', description: 'Best value for extended visibility' }
  ]

  const [selectedPlan, setSelectedPlan] = useState('')

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
                <div className="text-sm text-gray-600">{plan.duration}</div>
              </div>
            </div>
            
            {selectedPlan === plan.id && (
              <div className="flex items-center text-blue-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Selected</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedPlan}
          className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}

function Step4Payment({ formData, onBack, onSubmit, isLoading }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h2>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium">30-Day Plan</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium">₹299</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Pay ₹299'}
        </button>
      </div>
    </div>
  )
}
