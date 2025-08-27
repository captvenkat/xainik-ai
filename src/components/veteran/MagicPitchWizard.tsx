'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import AppContainer from '@/components/AppContainer'
import ObjectivePicker from '@/components/veteran/ObjectivePicker'
import ChipGroup from '@/components/veteran/ChipGroup'
import AutoPitch from '@/components/veteran/AutoPitch'
import ResumeUpload from './ResumeUpload'
import { CheckCircle, Upload, ArrowRight, LogIn } from 'lucide-react'
import type { AutoPitchOutput, StoryPreferences } from '../../types/xainik'

interface MagicPitchWizardProps {
  userFromServer?: { id: string; email?: string | null } | null
  onComplete: () => void
}

export default function MagicPitchWizard({ userFromServer, onComplete }: MagicPitchWizardProps) {
  const router = useRouter()
  const [clientUser, setClientUser] = useState<{ id: string; email?: string | null } | null | undefined>(undefined)
  const [currentStep, setCurrentStep] = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const [objective, setObjective] = useState('')
  const [preferences, setPreferences] = useState<StoryPreferences>({})
  const [autoPitch, setAutoPitch] = useState<AutoPitchOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Debug logging
  useEffect(() => {
    console.debug('[MPW] userFromServer', userFromServer)
    
    const supabase = createSupabaseBrowser()
    const { data: sub } = supabase.auth.onAuthStateChange((evt: any, session: any) => {
      console.debug('[MPW] onAuthStateChange', evt, !!session, session?.user?.id)
    })
    
    return () => sub.subscription.unsubscribe()
  }, [userFromServer])

  // Handle client-side session
  useEffect(() => {
    let mounted = true
    const supabase = createSupabaseBrowser()
    
    supabase.auth.getSession().then(({ data }: any) => {
      if (!mounted) return
      const u = data.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null
      console.debug('[MPW] client.getSession', {
        hasSession: !!data.session,
        user: data.session?.user?.id,
      })
      setClientUser(u)
    })
    
    const { data: sub } = supabase.auth.onAuthStateChange((_evt: any, session: any) => {
      const u = session?.user ? { id: session.user.id, email: session.user.email } : null
      setClientUser(u)
    })
    
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const loading = clientUser === undefined // first client pass
  const authedUser = clientUser ?? userFromServer ?? null

  // Step 1: Resume Upload
  const handleResumeUpload = useCallback(async (file: File) => {
    console.log('Resume upload triggered. Auth state:', { authedUser, loading })
    
    setIsLoading(true)
    setError('')

    // Check authentication before proceeding
    if (!authedUser) {
      console.log('Authentication check failed - no authenticated user')
      setError('Please sign in to upload your resume')
      setIsLoading(false)
      return
    }

    try {
      // Double-check authentication with Supabase
      const supabase = createSupabaseBrowser()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('Resume upload auth check:', { hasUser: !!user, userId: user?.id, authError: authError?.message })
      
      if (authError || !user) {
        setError('Authentication required. Please sign in again.')
        setIsLoading(false)
        // Redirect to sign in with return URL
        const currentPath = window.location.pathname
        window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`
        return
      }

      // Upload file using existing working endpoint with Magic Mode header
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: {
          'x-magic-mode': 'true'
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload resume')
      }

      const uploadData = await response.json()
      console.log('Resume upload success:', uploadData)

      // Store extracted text for AI processing
      setExtractedText(uploadData.extracted_text || uploadData.mockExtractedText || '')
      setCurrentStep(1)
    } catch (err) {
      console.error('Resume upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
    } finally {
      setIsLoading(false)
    }
  }, [authedUser, loading])

  // Step 2: Objective Selection
  const handleObjectiveSelect = useCallback((selectedObjective: string) => {
    setObjective(selectedObjective)
    setCurrentStep(2)
  }, [])

  const handleCustomObjective = useCallback((customObjective: string) => {
    setObjective(customObjective)
    setCurrentStep(2)
  }, [])

  // Step 3: Preferences Selection
  const handlePreferencesComplete = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      // Build targets array from preferences
      const targets = []
      if (preferences.jobType?.length) {
        targets.push(...preferences.jobType.map(type => ({ type: 'jobType' as const, value: type })))
      }
      if (preferences.industry?.length) {
        targets.push(...preferences.industry.map(industry => ({ type: 'industry' as const, value: industry })))
      }
      if (preferences.seniority?.length) {
        targets.push(...preferences.seniority.map(level => ({ type: 'seniority' as const, value: level })))
      }
      if (preferences.location?.length) {
        targets.push(...preferences.location.map(loc => ({ type: 'geography' as const, value: loc })))
      }
      if (preferences.role?.length) {
        targets.push(...preferences.role.map(role => ({ type: 'role' as const, value: role })))
      }
      if (preferences.availability?.length) {
        targets.push(...preferences.availability.map(avail => ({ type: 'availability' as const, value: avail })))
      }

      // Generate auto pitch
      const response = await fetch('/api/xainik/ai/auto-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          extracted_text: extractedText,
          targets
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate pitch')
      }

      const pitchData = await response.json()
      if (pitchData.explain) {
        setError(pitchData.explain)
      } else {
        setAutoPitch(pitchData)
        setCurrentStep(3)
      }
    } catch (err) {
      setError('Failed to generate pitch. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [objective, extractedText, preferences])

  // Step 4: Auto Pitch
  const handlePitchApprove = useCallback(async () => {
    if (!autoPitch) return

    setIsLoading(true)
    setError('')

    try {
      // Get current user
      const supabase = createSupabaseBrowser()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      // Build targets array from preferences
      const targets = []
      if (preferences.jobType?.length) {
        targets.push(...preferences.jobType.map(type => ({ type: 'jobType' as const, value: type })))
      }
      if (preferences.industry?.length) {
        targets.push(...preferences.industry.map(industry => ({ type: 'industry' as const, value: industry })))
      }
      if (preferences.seniority?.length) {
        targets.push(...preferences.seniority.map(level => ({ type: 'seniority' as const, value: level })))
      }
      if (preferences.location?.length) {
        targets.push(...preferences.location.map(loc => ({ type: 'geography' as const, value: loc })))
      }
      if (preferences.role?.length) {
        targets.push(...preferences.role.map(role => ({ type: 'role' as const, value: role })))
      }
      if (preferences.availability?.length) {
        targets.push(...preferences.availability.map(avail => ({ type: 'availability' as const, value: avail })))
      }

      // Create pitch using new API endpoint
      const pitchResponse = await fetch('/api/xainik/pitches/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          preferences: {
            ...preferences,
            targets
          },
          title: autoPitch.title,
          summary: autoPitch.summary
        })
      })

      if (!pitchResponse.ok) {
        throw new Error('Failed to create pitch')
      }

      const pitchData = await pitchResponse.json()

      // Call onComplete first (for any cleanup)
      onComplete()
      // Refresh x-prof via warmup to avoid stale-cookie loop
      router.replace('/auth/warmup?redirect=/dashboard/veteran')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pitch')
    } finally {
      setIsLoading(false)
    }
  }, [autoPitch, preferences, objective, onComplete])

  const handlePitchRegenerate = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      // Build targets array from preferences
      const targets = []
      if (preferences.jobType?.length) {
        targets.push(...preferences.jobType.map(type => ({ type: 'jobType' as const, value: type })))
      }
      if (preferences.industry?.length) {
        targets.push(...preferences.industry.map(industry => ({ type: 'industry' as const, value: industry })))
      }
      if (preferences.seniority?.length) {
        targets.push(...preferences.seniority.map(level => ({ type: 'seniority' as const, value: level })))
      }
      if (preferences.location?.length) {
        targets.push(...preferences.location.map(loc => ({ type: 'geography' as const, value: loc })))
      }
      if (preferences.role?.length) {
        targets.push(...preferences.role.map(role => ({ type: 'role' as const, value: role })))
      }
      if (preferences.availability?.length) {
        targets.push(...preferences.availability.map(avail => ({ type: 'availability' as const, value: avail })))
      }

      const response = await fetch('/api/xainik/ai/auto-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          extracted_text: extractedText,
          targets,
          regen_token: Date.now().toString(),
          pitch_id: null // Will be set after pitch creation
        })
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate pitch')
      }

      const pitchData = await response.json()
      if (pitchData.explain) {
        setError(pitchData.explain)
      } else {
        setAutoPitch(pitchData)
      }
    } catch (err) {
      setError('Failed to regenerate pitch. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [objective, extractedText, preferences])

  const handlePitchEdit = useCallback(() => {
    // For now, just regenerate
    handlePitchRegenerate()
  }, [handlePitchRegenerate])

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
              <p className="text-gray-600">
                Let Xainik AI analyze your military experience and create a compelling pitch
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <ResumeUpload
                onResumeUpload={handleResumeUpload}
                isLoading={isLoading}
                disabled={isLoading || !authedUser}
              />
            </div>

            {extractedText && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Resume ready ✓</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Career Objective</h2>
              <p className="text-gray-600">
                Select the career path that best matches your goals
              </p>
            </div>

            <ObjectivePicker
              extractedText={extractedText}
              selectedObjective={objective}
              onObjectiveSelect={handleObjectiveSelect}
              onCustomObjective={handleCustomObjective}
              isLoading={isLoading}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Preferences</h2>
              <p className="text-gray-600">
                Help us tailor your pitch to your specific needs
              </p>
            </div>

            <div className="space-y-6">
              <ChipGroup
                title="Job Type"
                chips={['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Hybrid']}
                selectedChips={preferences.jobType || []}
                onChipToggle={(chip) => {
                  const current = preferences.jobType || []
                  const updated = current.includes(chip)
                    ? current.filter(c => c !== chip)
                    : [...current, chip]
                  setPreferences({ ...preferences, jobType: updated })
                }}
                onCustomChip={(chip) => {
                  setPreferences({ 
                    ...preferences, 
                    jobType: [...(preferences.jobType || []), chip]
                  })
                }}
                maxSelection={3}
              />

              <ChipGroup
                title="Industry"
                chips={['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Consulting', 'Education', 'Government']}
                selectedChips={preferences.industry || []}
                onChipToggle={(chip) => {
                  const current = preferences.industry || []
                  const updated = current.includes(chip)
                    ? current.filter(c => c !== chip)
                    : [...current, chip]
                  setPreferences({ ...preferences, industry: updated })
                }}
                onCustomChip={(chip) => {
                  setPreferences({ 
                    ...preferences, 
                    industry: [...(preferences.industry || []), chip]
                  })
                }}
                maxSelection={3}
              />

              <ChipGroup
                title="Seniority Level"
                chips={['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Director', 'Executive']}
                selectedChips={preferences.seniority || []}
                onChipToggle={(chip) => {
                  const current = preferences.seniority || []
                  const updated = current.includes(chip)
                    ? current.filter(c => c !== chip)
                    : [...current, chip]
                  setPreferences({ ...preferences, seniority: updated })
                }}
                onCustomChip={(chip) => {
                  setPreferences({ 
                    ...preferences, 
                    seniority: [...(preferences.seniority || []), chip]
                  })
                }}
                maxSelection={3}
              />

              <ChipGroup
                title="Location"
                chips={['Remote', 'Hybrid', 'On-site', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune']}
                selectedChips={preferences.location || []}
                onChipToggle={(chip) => {
                  const current = preferences.location || []
                  const updated = current.includes(chip)
                    ? current.filter(c => c !== chip)
                    : [...current, chip]
                  setPreferences({ ...preferences, location: updated })
                }}
                onCustomChip={(chip) => {
                  setPreferences({ 
                    ...preferences, 
                    location: [...(preferences.location || []), chip]
                  })
                }}
                maxSelection={3}
              />

              <ChipGroup
                title="Role"
                chips={['Operations', 'Project Management', 'Supply Chain', 'Security', 'IT Infrastructure', 'Sales', 'HR']}
                selectedChips={preferences.role || []}
                onChipToggle={(chip) => {
                  const current = preferences.role || []
                  const updated = current.includes(chip)
                    ? current.filter(c => c !== chip)
                    : [...current, chip]
                  setPreferences({ ...preferences, role: updated })
                }}
                onCustomChip={(chip) => {
                  setPreferences({ 
                    ...preferences, 
                    role: [...(preferences.role || []), chip]
                  })
                }}
                maxSelection={3}
              />

              <ChipGroup
                title="Availability"
                chips={['Immediate', '2 weeks', '1 month', '3 months', 'Flexible']}
                selectedChips={preferences.availability || []}
                onChipToggle={(chip) => {
                  const current = preferences.availability || []
                  const updated = current.includes(chip)
                    ? current.filter(c => c !== chip)
                    : [...current, chip]
                  setPreferences({ ...preferences, availability: updated })
                }}
                onCustomChip={(chip) => {
                  setPreferences({ 
                    ...preferences, 
                    availability: [...(preferences.availability || []), chip]
                  })
                }}
                maxSelection={3}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePreferencesComplete}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Pitch...
                  </>
                ) : (
                  <>
                    Generate Pitch
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Pitch</h2>
              <p className="text-gray-600">
                Review and approve your AI-generated pitch
              </p>
            </div>

            {autoPitch && (
              <AutoPitch
                pitch={autoPitch}
                onApprove={handlePitchApprove}
                onRegenerate={handlePitchRegenerate}
                onEdit={handlePitchEdit}
                isLoading={isLoading}
                isRegenerating={isLoading}
              />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <AppContainer>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Checking your session...</p>
        </div>
      </AppContainer>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!authedUser) {
    console.log('Rendering sign-in prompt. Auth state:', { authedUser, loading, userFromServer, clientUser })
    return (
      <AppContainer>
        <div className="text-center space-y-6 py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign In Required</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Please sign in to use Magic Mode and create your AI-powered pitch
          </p>
          <button
            onClick={() => {
              const currentPath = window.location.pathname
              window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`
            }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </button>
        </div>
      </AppContainer>
    )
  }

  console.log('Rendering main wizard. Auth state:', { authedUser, loading, userFromServer, clientUser })
  
  return (
    <AppContainer>
      <div className="py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Resume', 'Objective', 'Preferences', 'Pitch'].map((step, index) => (
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
    </AppContainer>
  )
}
