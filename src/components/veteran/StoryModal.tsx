'use client'

import { useState } from 'react'
import { X, Calendar, Edit3, Share } from 'lucide-react'
import type { StoryPublic, StoryCandidate } from '../../types/xainik'

interface StoryModalProps {
  isOpen: boolean
  onClose: () => void
  story: StoryPublic | StoryCandidate
  onPublish?: () => void
  onEdit?: () => void
  onShare?: () => void
  isPublishing?: boolean
  isPublished?: boolean
  publishMessage?: string
}

export default function StoryModal({
  isOpen,
  onClose,
  story,
  onPublish,
  onEdit,
  onShare,
  isPublishing = false,
  isPublished = false,
  publishMessage
}: StoryModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(story)

  if (!isOpen) return null

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    onEdit?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(story)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Story Preview</h2>
            {isPublished && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Published
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editedContent.title}
                  onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={60}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  value={'summary' in editedContent ? editedContent.summary : ''}
                  onChange={(e) => setEditedContent({ ...editedContent, summary: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={300}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={'body_md' in editedContent ? editedContent.body_md : ''}
                  onChange={(e) => setEditedContent({ ...editedContent, body_md: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title and Meta */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {story.title}
                </h1>
                {'published_at' in story && story.published_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Published on {formatDate(story.published_at)}
                  </div>
                )}
              </div>

              {/* Summary */}
              {'summary' in story && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{story.summary}</p>
                </div>
              )}

              {/* Content */}
              {'body_md' in story && (
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: story.body_md.replace(/\n/g, '<br/>') }}
                  />
                </div>
              )}

              {/* Outline for candidates */}
              {'outline' in story && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Story Outline</h4>
                  <div className="space-y-2">
                    {story.outline.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publish Message */}
              {publishMessage && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">{publishMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex gap-2">
            {!isPublished && onPublish && (
              <button
                onClick={onPublish}
                disabled={isPublishing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPublishing ? 'Publishing...' : 'Publish Story'}
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={isEditing ? handleSave : handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Edit'}
              </button>
            )}
            
            {isEditing && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {onShare && (
              <button
                onClick={onShare}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
