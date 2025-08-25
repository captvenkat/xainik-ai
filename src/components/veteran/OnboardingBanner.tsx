'use client'

import { CheckCircle, Circle, ArrowRight } from 'lucide-react'

interface OnboardingBannerProps {
  currentStep: 'step1' | 'step2' | 'step3' | 'complete'
  onStepClick?: (step: 'step1' | 'step2' | 'step3') => void
}

export default function OnboardingBanner({ currentStep, onStepClick }: OnboardingBannerProps) {
  const steps = [
    { id: 'step1', label: 'Profile', description: 'Complete your military profile' },
    { id: 'step2', label: 'Pitch', description: 'Create your career pitch' },
    { id: 'step3', label: 'Track', description: 'Monitor your progress' }
  ]

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  const getStepIcon = (stepId: string) => {
    const status = getStepStatus(stepId)
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'current':
        return <Circle className="w-5 h-5 text-blue-500 fill-current" />
      default:
        return <Circle className="w-5 h-5 text-gray-300" />
    }
  }

  const getStepClasses = (stepId: string) => {
    const status = getStepStatus(stepId)
    
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'current':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Career Journey</h2>
        <p className="text-gray-600">Follow these steps to maximize your success</p>
      </div>

      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step */}
            <button
              onClick={() => onStepClick?.(step.id as 'step1' | 'step2' | 'step3')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                getStepClasses(step.id)
              } ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {getStepIcon(step.id)}
              <div className="text-left">
                <div className="font-medium">{step.label}</div>
                <div className="text-xs opacity-75">{step.description}</div>
              </div>
            </button>

            {/* Arrow */}
            {index < steps.length - 1 && (
              <div className="mx-2">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>Progress:</span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${currentStep === 'step1' ? 33 : currentStep === 'step2' ? 66 : 100}%` 
              }}
            />
          </div>
          <span>
            {currentStep === 'step1' ? '33%' : currentStep === 'step2' ? '66%' : '100%'}
          </span>
        </div>
      </div>

      {/* Current step message */}
      {currentStep !== 'complete' && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700">
              {currentStep === 'step1' && 'Complete your profile to get started'}
              {currentStep === 'step2' && 'Create your pitch to showcase your skills'}
              {currentStep === 'step3' && 'Start tracking your progress and performance'}
            </span>
          </div>
        </div>
      )}

      {/* Completion message */}
      {currentStep === 'complete' && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              🎉 All steps completed! You're ready to succeed
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
