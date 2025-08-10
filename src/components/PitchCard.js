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

export default function PitchCard({ pitch, variant = 'default' }) {
  const {
    id,
    title,
    pitch_text,
    skills = [],
    location,
    availability,
    likes_count = 0,
    veteran,
    veteran_profile
  } = pitch

  const veteranName = veteran?.name || 'Veteran'
  const veteranRank = veteran_profile?.rank
  const veteranBranch = veteran_profile?.service_branch
  const veteranYears = veteran_profile?.years_experience

  // Check if veteran has community verification (≥10 endorsements)
  const isCommunityVerified = pitch.endorsement_count >= 10

  // Extract city from location (format: "City, Country")
  const city = location?.split(',')[0]?.trim() || location

  // Truncate pitch text to ~150 characters
  const truncatedPitch = pitch_text?.length > 150 
    ? pitch_text.substring(0, 150) + '...' 
    : pitch_text

  const handleCall = () => {
    if (pitch.phone) {
      window.location.href = `tel:${pitch.phone}`
    }
  }

  return (
    <div className="group bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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
                {veteranRank && `${veteranRank} • `}{veteranBranch}
                {veteranYears && ` • ${veteranYears} years`}
              </div>
            </div>
          </div>
          {isCommunityVerified && (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Award className="h-3 w-3" />
              <span className="text-xs font-medium">🛡️ Verified</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">{title}</h3>

        {/* Pitch Content */}
        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed text-sm">{truncatedPitch}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
              {skill}
            </span>
          ))}
        </div>

        {/* Location & Availability */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{availability}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span className="font-medium">{likes_count} likes</span>
          </div>
          <LikeButton 
            pitchId={id} 
            initialCount={likes_count}
            userId={pitch.userId} // Pass from parent component
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCall}
            disabled={!pitch.phone}
            className="flex-1 btn-success text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone className="h-4 w-4 inline mr-1" />
            {pitch.phone ? '📞 Call' : 'No Phone'}
          </button>
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
