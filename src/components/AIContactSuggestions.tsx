'use client'

import { useState, useEffect } from 'react'
import { Users, Sparkles, Mail, Phone, Star, TrendingUp, RefreshCw, Loader2 } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import type { ContactSuggestion } from '@/lib/openai'

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
  const [error, setError] = useState('')
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  const supabase = createSupabaseBrowser()

  // Generate AI-powered contact suggestions
  const generateSuggestions = async () => {
    if (!pitchId) return

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/ai/contact-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pitchId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate suggestions')
      }

      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.suggestions)
        setLastGenerated(new Date())
        
        if (data.warning) {
          setError(data.warning)
        }
      } else {
        throw new Error('Failed to generate suggestions')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  // Load suggestions on component mount if pitchId is available
  useEffect(() => {
    if (pitchId && suggestions.length === 0) {
      generateSuggestions()
    }
  }, [pitchId])

  const handleSuggestionAction = (suggestion: ContactSuggestion) => {
    setSelectedSuggestion(suggestion)
    
    // Handle different action types
    switch (suggestion.suggestedAction) {
      case 'email':
        if (suggestion.contactInfo?.email) {
          window.open(`mailto:${suggestion.contactInfo.email}?subject=Professional Connection - Xainik`, '_blank')
        }
        break
      case 'linkedin':
        if (suggestion.contactInfo?.linkedin) {
          window.open(suggestion.contactInfo.linkedin, '_blank')
        }
        break
      case 'call':
        if (suggestion.contactInfo?.phone) {
          window.open(`tel:${suggestion.contactInfo.phone}`, '_blank')
        }
        break
      case 'referral':
        // Handle referral logic
        break
    }
  }

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
      case 'email': return <Mail className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      case 'linkedin': return <Star className="w-4 h-4" />
      case 'referral': return <Users className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'email': return 'bg-blue-500 hover:bg-blue-600'
      case 'call': return 'bg-green-500 hover:bg-green-600'
      case 'linkedin': return 'bg-blue-600 hover:bg-blue-700'
      case 'referral': return 'bg-purple-500 hover:bg-purple-600'
      default: return 'bg-blue-500 hover:bg-blue-600'
    }
  }

  if (!pitchId) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Contact Suggestions</h3>
        <p className="text-gray-600">Create a pitch to get AI-powered contact suggestions</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Contact Suggestions</h3>
              <p className="text-sm text-gray-600">
                Strategic connections to accelerate your job search
              </p>
            </div>
          </div>
          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Generating...' : 'Refresh'}</span>
          </button>
        </div>
        
        {lastGenerated && (
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {lastGenerated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">AI is analyzing your profile...</span>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{suggestion.name}</h4>
                    <p className="text-sm text-gray-600">{suggestion.role}</p>
                    <p className="text-sm text-gray-500">{suggestion.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConnectionStrengthColor(suggestion.connectionStrength)}`}>
                      {suggestion.connectionStrength} match
                    </span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        {suggestion.successProbability}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3">{suggestion.reason}</p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSuggestionAction(suggestion)}
                    className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors ${getActionColor(suggestion.suggestedAction)}`}
                  >
                    {getActionIcon(suggestion.suggestedAction)}
                    <span className="capitalize">{suggestion.suggestedAction}</span>
                  </button>

                  {suggestion.contactInfo && (
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      {suggestion.contactInfo.email && (
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </span>
                      )}
                      {suggestion.contactInfo.phone && (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>Phone</span>
                        </span>
                      )}
                      {suggestion.contactInfo.linkedin && (
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>LinkedIn</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h4>
            <p className="text-gray-600 mb-4">
              Click "Refresh" to generate AI-powered contact suggestions based on your pitch
            </p>
            <button
              onClick={generateSuggestions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
