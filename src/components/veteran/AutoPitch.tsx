'use client'

import { useState } from 'react'
import { Check, RefreshCw, Edit3 } from 'lucide-react'
import type { AutoPitchOutput } from '../../types/xainik'

interface AutoPitchProps {
  pitch: AutoPitchOutput
  onApprove: () => void
  onRegenerate: () => void
  onEdit: () => void
  isLoading?: boolean
  isRegenerating?: boolean
}

export default function AutoPitch({
  pitch,
  onApprove,
  onRegenerate,
  onEdit,
  isLoading = false,
  isRegenerating = false
}: AutoPitchProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedPitch, setEditedPitch] = useState(pitch)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    onEdit()
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedPitch(pitch)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">AI-Generated Pitch</h3>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">AI-Generated Pitch</h3>
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={editedPitch.title}
                onChange={(e) => setEditedPitch({ ...editedPitch, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={80}
              />
              <div className="absolute right-3 top-2 text-xs text-gray-500">
                {editedPitch.title.length}/80
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary
            </label>
            <div className="relative">
              <textarea
                value={editedPitch.summary}
                onChange={(e) => setEditedPitch({ ...editedPitch, summary: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={300}
              />
              <div className="absolute right-3 bottom-2 text-xs text-gray-500">
                {editedPitch.summary.length}/300
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900">Title</h4>
              <span className="text-xs text-gray-500">{pitch.title.length}/80</span>
            </div>
            <p className="text-gray-700">{pitch.title}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900">Summary</h4>
              <span className="text-xs text-gray-500">{pitch.summary.length}/300</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{pitch.summary}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onApprove}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Generating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
