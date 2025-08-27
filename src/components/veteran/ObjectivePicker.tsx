'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

interface ObjectivePickerProps {
  extractedText: string
  selectedObjective: string
  onObjectiveSelect: (objective: string) => void
  onCustomObjective: (objective: string) => void
  isLoading?: boolean
}

export default function ObjectivePicker({
  extractedText,
  selectedObjective,
  onObjectiveSelect,
  onCustomObjective,
  isLoading = false
}: ObjectivePickerProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customObjective, setCustomObjective] = useState('')
  const [objectives, setObjectives] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleCustomSubmit = () => {
    if (customObjective.trim()) {
      onCustomObjective(customObjective.trim())
      setCustomObjective('')
      setShowCustomInput(false)
    }
  }

  // Generate objectives from AI when component mounts
  useEffect(() => {
    const generateObjectives = async () => {
      if (!extractedText || objectives.length > 0) return
      
      setIsGenerating(true)
      setError('')
      
      try {
        const response = await fetch('/api/xainik/ai/suggest-objectives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extracted_text: extractedText })
        })

        if (!response.ok) {
          throw new Error('Failed to generate objectives')
        }

        const data = await response.json()
        if (data.explain) {
          setError(data.explain)
        } else {
          setObjectives(data.objectives || [])
        }
      } catch (err) {
        setError('Failed to generate objectives. Please try again.')
      } finally {
        setIsGenerating(false)
      }
    }

    generateObjectives()
  }, [extractedText, objectives.length])

  if (isLoading || isGenerating) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What's your career objective?</h3>
        <div className="flex flex-wrap gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded-full animate-pulse"
              style={{ width: `${Math.random() * 120 + 80}px` }}
            />
          ))}
        </div>
        {isGenerating && (
          <p className="text-sm text-gray-600 text-center">Generating personalized objectives...</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">What's your career objective?</h3>
      
      <div className="flex flex-wrap gap-3">
        {objectives.map((objective) => (
          <button
            key={objective}
            onClick={() => onObjectiveSelect(objective)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedObjective === objective
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {objective}
          </button>
        ))}
        
        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
            >
              Try again
            </button>
          </div>
        )}
        
        <button
          onClick={() => setShowCustomInput(true)}
          className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Custom
        </button>
      </div>

      {showCustomInput && (
        <div className="space-y-3">
          <input
            type="text"
            value={customObjective}
            onChange={(e) => setCustomObjective(e.target.value)}
            placeholder="Enter your career objective..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={80}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCustomSubmit}
              disabled={!customObjective.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Objective
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false)
                setCustomObjective('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
