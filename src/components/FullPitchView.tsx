'use client'

import { useState } from 'react'
import { 
  Shield, 
  Heart, 
  Phone, 
  MapPin, 
  Clock, 
  Award,
  Eye,
  Calendar,
  FileText,
  Link as LinkIcon,
  Share2,
  Download,
  Star,
  User,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import LikeButton from '@/components/LikeButton'
import type { FullPitchData } from '@/types/domain'

interface FullPitchViewProps {
  pitch: FullPitchData
  onContact?: () => void
  onRequestResume?: () => void
  currentUserId?: string
}

export default function FullPitchView({ pitch, onContact, onRequestResume, currentUserId }: FullPitchViewProps) {
  const [showContactInfo, setShowContactInfo] = useState(false)
  
  const {
    id,
    title,
    pitch_text,
    skills = [],
    location,
    job_type,
    availability,
    photo_url,
    experience_years,
    linkedin_url,
    resume_url,
    resume_share_enabled,
    phone,
    likes_count,
    views_count,
    endorsements_count,
    plan_tier,
    created_at,
    updated_at,
    endorsements,
    user
  } = pitch

  const veteranName = user?.name || 'Veteran'
  const veteranRole = 'veteran'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlanBadge = () => {
    if (plan_tier === 'premium') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⭐ Premium</span>
    }
    if (plan_tier === 'enterprise') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">🚀 Enterprise</span>
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Free</span>
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {photo_url ? (
              <img 
                src={photo_url} 
                alt={veteranName}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                <Shield className="h-10 w-10 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{veteranName}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">🛡️ Veteran</span>
                </div>
                {getPlanBadge()}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="text-right">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{views_count}</div>
                <div className="text-xs text-gray-600">Views</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600">{likes_count}</div>
                <div className="text-xs text-gray-600">Likes</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{endorsements_count}</div>
                <div className="text-xs text-gray-600">Endorsements</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {location && (
            <div className="flex items-center gap-2 text-gray-600 bg-white/80 rounded-lg p-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{location}</span>
            </div>
          )}
          {job_type && (
            <div className="flex items-center gap-2 text-gray-600 bg-white/80 rounded-lg p-3">
              <Calendar className="h-5 w-5 text-green-500" />
              <span className="font-medium">{job_type.charAt(0).toUpperCase() + job_type.slice(1)}</span>
            </div>
          )}
          {availability && (
            <div className="flex items-center gap-2 text-gray-600 bg-white/80 rounded-lg p-3">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="font-medium">{availability}</span>
            </div>
          )}
          {experience_years && (
            <div className="flex items-center gap-2 text-gray-600 bg-white/80 rounded-lg p-3">
              <Award className="h-5 w-5 text-orange-500" />
              <span className="font-medium">{experience_years} years</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {/* Skills */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, index: number) => (
              <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full border border-blue-200 font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Pitch Description */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{pitch_text}</p>
          </div>
        </div>

        {/* Endorsements */}
        {endorsements && endorsements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Endorsements</h3>
            <div className="space-y-3">
              {endorsements.slice(0, 5).map((endorsement, index) => (
                <div key={(endorsement as any).id || `endorsement-${index}`} className="bg-gray-50 rounded-lg p-4">
                                     <div className="flex items-start gap-3">
                     <div className="flex items-center gap-2">
                       {/* Rating display removed - not available in current schema */}
                     </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{(endorsement as any).text || 'Endorsement text not available'}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <span className="font-medium">
                          {(endorsement as any).endorser?.name || 'Anonymous'}
                        </span>
                        <span>•</span>
                        <span>{(endorsement as any).created_at ? formatDate((endorsement as any).created_at) : 'Recently'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact & Actions */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Edit Button (only for pitch owner) */}
            {currentUserId && user?.id === currentUserId && (
              <Link
                href={`/pitch/${id}/edit`}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-5 w-5" />
                Edit Pitch
              </Link>
            )}
            {/* Contact Button */}
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="h-5 w-5" />
              {showContactInfo ? 'Hide Contact Info' : 'Show Contact Info'}
            </button>

            {/* Resume Request */}
            {resume_url && resume_share_enabled && (
              <button
                onClick={onRequestResume}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Request Resume
              </button>
            )}

            {/* LinkedIn */}
            {linkedin_url && (
              <Link
                href={linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <LinkIcon className="h-5 w-5" />
                View LinkedIn
              </Link>
            )}

            {/* Share */}
            <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Pitch
            </button>
          </div>

          {/* Contact Information */}
          {showContactInfo && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">{phone}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    <span className="text-gray-700">{location}</span>
                  </div>
                )}
                {availability && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-gray-700">Available: {availability}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Pitch created on {formatDate(created_at)}</p>
          {updated_at !== created_at && (
            <p>Last updated on {formatDate(updated_at)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
