'use client'

import { 
  Shield, 
  Heart, 
  Phone, 
  MapPin, 
  Clock, 
  Award,
  Eye,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import LikeButton from '@/components/LikeButton'

import type { PitchCardData } from '@/types/domain'

type Props = { data: PitchCardData; variant?: 'default' | 'featured' };

export default function PitchCard({ data, variant = 'default' }: Props) {
  const {
    id,
    title,
    pitch_text,
    skills = [],
    // location removed - not available in current schema
    // job_type removed - not available in current schema
    // availability removed - not available in current schema
    // likes_count removed - not available in current schema
    user
  } = data

  const veteranName = user?.name || 'Veteran'
  const veteranRole = 'veteran' // Default role since not available in current schema

  // Truncate pitch text to ~150 characters
  const truncatedPitch = pitch_text?.length > 150 
    ? pitch_text.substring(0, 150) + '...' 
    : pitch_text

  return (
    <div data-test="pitch-card" className="group bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900">{veteranName}</div>
              <div className="text-sm text-gray-600 font-medium">
                {veteranRole}
              </div>
            </div>
          </div>
          {veteranRole === 'veteran' && (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Award className="h-3 w-3" />
              <span className="text-xs font-medium">🛡️ Veteran</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">{title}</h3>

        {/* Pitch Content */}
        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed text-sm">{truncatedPitch}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 3).map((skill: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
              {skill}
            </span>
          ))}
        </div>

        {/* Location & Availability */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Location not specified</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Availability not specified</span>
          </div>
        </div>

        {/* Job Type */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <span className="font-medium">Job type not specified</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span className="font-medium">0 likes</span>
          </div>
          <LikeButton 
            pitchId={id} 
            initialCount={0}
            userId={user?.id} // Use user.id instead of veteran.id
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link 
            href={`/pitch/${id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1"
          >
            View Details
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
