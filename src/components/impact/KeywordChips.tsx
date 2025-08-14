'use client'

import { useState } from 'react'
import { Tag, Check, Plus, Sparkles } from 'lucide-react'
import { KeywordData } from '@/lib/actions/impact/keywords'
import { applyKeywordToHeadline } from '@/lib/actions/impact/keywords'

interface KeywordChipsProps {
  data?: KeywordData[]
  pitchId?: string
}

export default function KeywordChips({ data, pitchId }: KeywordChipsProps) {
  const [applying, setApplying] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<KeywordData[]>(data || [])

  const handleApplyKeyword = async (phrase: string) => {
    if (!pitchId) return
    
    setApplying(phrase)
    try {
      const success = await applyKeywordToHeadline(pitchId, phrase)
      if (success) {
        setKeywords(prev => 
          prev.map(k => 
            k.phrase === phrase 
              ? { ...k, appliedToHeadline: true, appliedDate: new Date().toISOString() }
              : k
          )
        )
      }
    } catch (error) {
      console.error('Error applying keyword:', error)
    } finally {
      setApplying(null)
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Keyword Optimization</h3>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No keyword suggestions available</p>
          <p className="text-sm text-gray-400 mt-2">Keywords will appear as your pitch gains traction</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Keyword Optimization</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">
          High-performing keywords that can improve your pitch visibility:
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <div
            key={keyword.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
              keyword.appliedToHeadline
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">{keyword.phrase}</span>
            
            {keyword.appliedToHeadline ? (
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">Applied</span>
              </div>
            ) : (
              <button
                onClick={() => handleApplyKeyword(keyword.phrase)}
                disabled={applying === keyword.phrase || !pitchId}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  applying === keyword.phrase
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {applying === keyword.phrase ? (
                  <>
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Applying...
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    Apply
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Applied keywords summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Applied Keywords: {keywords.filter(k => k.appliedToHeadline).length}
            </p>
            <p className="text-xs text-gray-600">
              Keywords help improve your pitch visibility in searches
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {keywords.filter(k => k.appliedToHeadline).length}/{keywords.length}
            </p>
            <p className="text-xs text-gray-600">Applied</p>
          </div>
        </div>
      </div>
    </div>
  )
}
