'use client'

import { useState } from 'react'
import { ArrowRight, RefreshCw } from 'lucide-react'
import type { StoryCandidate } from '../../types/xainik'

interface StorySuggestionsProps {
  suggestions: StoryCandidate[]
  onUseStory: (story: StoryCandidate) => void
  onMoreSuggestions: () => void
  onEditStory: (story: StoryCandidate) => void
  isLoading?: boolean
  isGeneratingMore?: boolean
}

export default function StorySuggestions({
  suggestions,
  onUseStory,
  onMoreSuggestions,
  onEditStory,
  isLoading = false,
  isGeneratingMore = false
}: StorySuggestionsProps) {
  const [selectedStory, setSelectedStory] = useState<StoryCandidate | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Daily Story Suggestions</h3>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Daily Story Suggestions</h3>
        <button
          onClick={onMoreSuggestions}
          disabled={isGeneratingMore}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${isGeneratingMore ? 'animate-spin' : ''}`} />
          {isGeneratingMore ? 'Generating...' : 'See another 3'}
        </button>
      </div>
      
      <div className="grid gap-4">
        {suggestions.map((story, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                {story.title}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                {index + 1}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {story.angle}
            </p>
            
            <div className="space-y-1 mb-4">
              {story.outline.map((point, pointIndex) => (
                <div key={pointIndex} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-gray-600 leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onUseStory(story)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowRight className="w-3 h-3" />
                Use this
              </button>
              <button
                onClick={() => onEditStory(story)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {suggestions.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No story suggestions yet</h4>
          <p className="text-gray-600 mb-4">
            Complete your pitch to get AI-powered story suggestions
          </p>
          <button
            onClick={onMoreSuggestions}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Generate Suggestions
          </button>
        </div>
      )}
    </div>
  )
}
