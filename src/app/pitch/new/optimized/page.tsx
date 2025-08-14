'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import SmartPhotoManager from '@/components/SmartPhotoManager'
import AIPitchHelper from '@/components/AIPitchHelper'
import { Shield, CheckCircle, AlertCircle, User, MapPin, Calendar, Phone, Mail } from 'lucide-react'

interface OptimizedFormData {
  // Unique to pitch (not in profile)
  title: string
  pitch_text: string
  skills: string[]
  job_type: string
  availability: string
  photo_url?: string
  photo_source: 'profile' | 'custom' | 'none'
  resume_url?: string
  resume_share_enabled: boolean
}

const JOB_TYPES = [
  'full-time', 'part-time', 'freelance', 'consulting',
  'hybrid', 'project-based', 'remote', 'on-site'
]

const AVAILABILITY_OPTIONS = [
  'Immediate', '30 days', '60 days', '90 days'
]

export default function OptimizedNewPitchPage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<OptimizedFormData>({
    title: '',
    pitch_text: '',
    skills: ['', '', ''],
    job_type: '',
    availability: '',
    photo_source: 'profile',
    resume_share_enabled: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Auto-populate from profile data
  useEffect(() => {
    if (profile && !formData.title) {
      // Auto-generate title from profile data
      const autoTitle = `${profile.name} - ${profile.role} Professional`
      setFormData(prev => ({ ...prev, title: autoTitle }))
    }
  }, [profile, formData.title])

  const updateFormData = useCallback((updates: Partial<OptimizedFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handlePhotoChange = useCallback((photoUrl: string, source: 'profile' | 'custom' | 'none') => {
    updateFormData({ 
      photo_url: photoUrl || undefined,
      photo_source: source
    })
  }, [updateFormData])

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const supabase = createSupabaseBrowser()
      
      if (!user) {
        throw new Error('Authentication required')
      }

      // Validate required fields
      if (!formData.title.trim() || !formData.pitch_text.trim() || formData.skills.some(skill => !skill.trim())) {
        throw new Error('Please complete all required fields')
      }

      // Get profile data for auto-population
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: veteranProfile } = await supabase
        .from('veterans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Create pitch with profile data auto-populated
      const { data: pitch, error: pitchError } = await supabase
        .from('pitches')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          pitch_text: formData.pitch_text.trim(),
          skills: formData.skills.map(skill => skill.trim()).filter(Boolean),
          job_type: formData.job_type,
          // Auto-populate from profile (no duplication)
          location: veteranProfile?.location_current || userProfile?.location || '',
          experience_years: veteranProfile?.years_experience || 0,
          phone: userProfile?.phone || '',
          email: user.email || '', // Use email from auth
          linkedin_url: userProfile?.linkedin_url || '',
          // Custom pitch data
          photo_url: formData.photo_url,
          resume_url: formData.resume_url,
          resume_share_enabled: formData.resume_share_enabled,
          availability: formData.availability,
          is_active: true,
          plan_tier: 'free', // Default to free plan
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (pitchError) {
        throw new Error('Failed to create pitch')
      }

      // Redirect to the new pitch
      router.push(`/pitch/${pitch.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pitch')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Pitch</h1>
          </div>
          <p className="text-gray-600">
            Create a professional pitch using your profile data and AI assistance
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {['Basic Info', 'AI Enhancement', 'Review'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
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

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 0 && (
          <Step1BasicInfo 
            formData={formData} 
            updateFormData={updateFormData}
            profile={profile}
            user={user}
            onPhotoChange={handlePhotoChange}
            onNext={() => setCurrentStep(1)}
          />
        )}
        
        {currentStep === 1 && (
          <Step2AIEnhancement 
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
          />
        )}
        
        {currentStep === 2 && (
          <Step3Review 
            formData={formData}
            profile={profile}
            user={user}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(1)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

function Step1BasicInfo({ formData, updateFormData, profile, user, onPhotoChange, onNext }: {
  formData: OptimizedFormData
  updateFormData: (updates: Partial<OptimizedFormData>) => void
  profile: any
  user: any
  onPhotoChange: (photoUrl: string, source: 'profile' | 'custom' | 'none') => void
  onNext: () => void
}) {
  const isValid = formData.title.trim() && formData.job_type && formData.availability

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Pitch Information</h2>
      
      <div className="space-y-6">
        {/* Profile Data Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Auto-Populated from Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span><strong>Name:</strong> {profile?.name || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span><strong>Location:</strong> {profile?.location || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span><strong>Phone:</strong> {profile?.phone || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span><strong>Experience:</strong> {profile?.years_experience || 'Not set'} years</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span><strong>Email:</strong> {user?.email || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Pitch Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pitch Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="e.g., Senior Software Engineer - Full Stack Development"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

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

        {/* Smart Photo Manager */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pitch Photo
          </label>
          <SmartPhotoManager
            profilePhotoUrl={profile?.avatar_url}
            pitchPhotoUrl={formData.photo_url}
            onPhotoChange={onPhotoChange}
            size="lg"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: AI Enhancement
        </button>
      </div>
    </div>
  )
}

function Step2AIEnhancement({ formData, updateFormData, onNext, onBack }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Pitch Enhancement</h2>
      
      <AIPitchHelper
        formData={formData}
        updateFormData={updateFormData}
        onNext={onNext}
        onBack={onBack}
      />
    </div>
  )
}

function Step3Review({ formData, profile, user, onSubmit, onBack, isLoading }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Pitch</h2>
      
      <div className="space-y-6">
        {/* Pitch Details */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pitch Details</h3>
          <div className="space-y-3">
            <div><strong>Title:</strong> {formData.title}</div>
            <div><strong>Job Type:</strong> {formData.job_type}</div>
            <div><strong>Availability:</strong> {formData.availability}</div>
            <div><strong>Skills:</strong> {formData.skills.filter(Boolean).join(', ')}</div>
          </div>
        </div>

        {/* Profile Data */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Profile Data (Auto-Populated)</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {profile?.name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Location:</strong> {profile?.location}</div>
            <div><strong>Phone:</strong> {profile?.phone}</div>
            <div><strong>Experience:</strong> {profile?.years_experience} years</div>
          </div>
        </div>

        {/* Photo Status */}
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Photo</h3>
          <div className="text-sm">
            <strong>Source:</strong> {formData.photo_source === 'profile' ? 'Profile Photo' : 'Custom Upload'}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Pitch'}
        </button>
      </div>
    </div>
  )
}
