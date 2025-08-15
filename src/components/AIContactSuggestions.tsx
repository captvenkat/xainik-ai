'use client'

import { useState, useEffect } from 'react'
import { Users, Sparkles, Mail, Phone, Star, TrendingUp } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface ContactSuggestion {
  id: string
  name: string
  role: string
  company: string
  connectionStrength: 'high' | 'medium' | 'low'
  suggestedAction: 'email' | 'call' | 'linkedin' | 'referral'
  reason: string
  successProbability: number
}

interface AIContactSuggestionsProps {
  userId: string
  pitchId?: string
  className?: string
}

export default function AIContactSuggestions({ 
  userId, 
  pitchId, 
  className = '' 
}: AIContactSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ContactSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContactSuggestion | null>(null)

  const supabase = createSupabaseBrowser()

  // Generate AI-powered contact suggestions
  const generateSuggestions = async () => {
    if (!pitchId) return

    setIsLoading(true)
    try {
      // Fetch pitch data for context
      const { data: pitch } = await supabase
        .from('pitches')
        .select('title, skills, job_type, location')
        .eq('id', pitchId)
        .single()

      if (!pitch) return

      // Generate mock AI suggestions based on pitch data
      const mockSuggestions: ContactSuggestion[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Senior Recruiter',
          company: 'TechCorp Solutions',
          connectionStrength: 'high',
          suggestedAction: 'email',
          reason: 'Actively hiring for roles matching your skills',
          successProbability: 85
        },
        {
          id: '2',
          name: 'Michael Chen',
          role: 'Engineering Manager',
          company: 'InnovateTech',
          connectionStrength: 'medium',
          suggestedAction: 'linkedin',
          reason: 'Your experience aligns with their team needs',
          successProbability: 72
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          role: 'HR Director',
          company: 'StartupXYZ',
          connectionStrength: 'high',
          suggestedAction: 'call',
          reason: 'Looking for talent in your location',
          successProbability: 78
        },
        {
          id: '4',
          name: 'David Kim',
          role: 'CTO',
          company: 'ScaleUp Inc',
          connectionStrength: 'low',
          suggestedAction: 'referral',
          reason: 'Network connection could introduce you',
          successProbability: 45
        }
      ]

      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error('Error generating contact suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (pitchId) {
      generateSuggestions()
    }
  }, [pitchId])

  const getConnectionStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'email': return Mail
      case 'call': return Phone
      case 'linkedin': return Users
      case 'referral': return Star
      default: return Mail
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'email': return 'bg-blue-600 hover:bg-blue-700'
      case 'call': return 'bg-green-600 hover:bg-green-700'
      case 'linkedin': return 'bg-blue-500 hover:bg-blue-600'
      case 'referral': return 'bg-purple-600 hover:bg-purple-700'
      default: return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  const handleContactAction = (suggestion: ContactSuggestion) => {
    setSelectedSuggestion(suggestion)
    // Here you would implement the actual contact action
    console.log('Contacting:', suggestion.name, 'via', suggestion.suggestedAction)
  }

  if (!pitchId) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Create a pitch to get AI-powered contact suggestions</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Contact Suggestions</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Smart recommendations for people to connect with
        </p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Analyzing your network...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No suggestions available yet</p>
            <p className="text-sm">Share your pitch to get AI recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => {
              const ActionIcon = getActionIcon(suggestion.suggestedAction)
              return (
                <div
                  key={suggestion.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConnectionStrengthColor(suggestion.connectionStrength)}`}>
                          {suggestion.connectionStrength} connection
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {suggestion.role} at {suggestion.company}
                      </p>
                      
                      <p className="text-sm text-gray-700 mb-3">
                        {suggestion.reason}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            {suggestion.successProbability}% success probability
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleContactAction(suggestion)}
                      className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${getActionColor(suggestion.suggestedAction)}`}
                    >
                      <ActionIcon className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">
                        {suggestion.suggestedAction}
                      </span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Success Probability Legend */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>AI-powered recommendations</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>High probability</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Medium probability</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Low probability</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
