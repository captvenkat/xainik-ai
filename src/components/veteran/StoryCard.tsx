'use client'

import { Calendar, Eye, Share } from 'lucide-react'
import type { StoryPublic } from '../../types/xainik'

interface StoryCardProps {
  story: StoryPublic
  onView: (story: StoryPublic) => void
  onShare: (story: StoryPublic) => void
  viewCount?: number
}

export default function StoryCard({
  story,
  onView,
  onShare,
  viewCount = 0
}: StoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm leading-tight flex-1 mr-3">
          {story.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {story.published_at && formatDate(story.published_at)}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
        {story.summary}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {viewCount} views
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onView(story)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onShare(story)}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <Share className="w-3 h-3" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
