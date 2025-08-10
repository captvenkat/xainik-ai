'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import AIPitchHelper from '@/components/AIPitchHelper'
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
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    job_type: '',
    location_current: '',
    location_preferred: [],
    availability: '',
    phone: '',
    title: '',
    pitch: '',
    skills: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    const supabase = getBrowserSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?redirect=/pitch/new')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'veteran') {
      setError('Only veterans can create pitches')
      return
    }

    setUserRole(profile.role)

    // Check if this is their first pitch
    const { data: existingPitches } = await supabase
      .from('pitches')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    setIsFirstTime(existingPitches?.length === 0)
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/pitch/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create pitch')
      }

      const { pitchId } = await response.json()
      router.push(`/pitch/${pitchId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    )
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create Your Pitch</h1>
          </div>
          {isFirstTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                Welcome! This is your first pitch. We'll help you create a compelling profile that showcases your military experience and skills.
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {['Basics', 'AI Input', 'Review', 'Plan', 'Pay'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-500'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < 4 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 0 && (
            <Step0Basics 
              formData={formData} 
              updateFormData={updateFormData} 
              onNext={handleNext}
            />
          )}
          
          {currentStep === 1 && (
            <Step1AIInput 
              formData={formData} 
              updateFormData={updateFormData} 
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 2 && (
            <Step2Review 
              formData={formData} 
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 3 && (
            <Step3Plan 
              formData={formData} 
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 4 && (
            <Step4Payment 
              formData={formData} 
              onBack={handleBack}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
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
          <input
            type="text"
            value={formData.location_current}
            onChange={(e) => updateFormData({ location_current: e.target.value })}
            placeholder="Enter your current city"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function Step1AIInput({ formData, updateFormData, onNext, onBack }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Pitch Generation</h2>
      <AIPitchHelper 
        formData={formData}
        updateFormData={updateFormData}
        onNext={onNext}
        onBack={onBack}
      />
    </div>
  )
}

function Step2Review({ formData, onNext, onBack }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Pitch</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pitch Preview</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-gray-900 font-medium">{formData.title}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pitch</label>
              <p className="text-gray-900">{formData.pitch}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <p className="text-gray-900">{formData.job_type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <p className="text-gray-900">{formData.availability}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
            <p className="text-gray-900">{formData.location_current}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <p className="text-gray-900">{formData.phone}</p>
          </div>
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
          className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Continue to Plan Selection
        </button>
      </div>
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
