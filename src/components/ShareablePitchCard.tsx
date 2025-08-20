'use client'

import { 
  Shield, 
  Heart, 
  MapPin, 
  Clock, 
  Award,
  Eye,
  Star,
  Calendar,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Users
} from 'lucide-react'
import Link from 'next/link'

import type { PitchCardData } from '../../types/domain'

type Props = { 
  data: PitchCardData; 
  variant?: 'default' | 'featured' | 'social';
  showStats?: boolean;
  showActions?: boolean;
};

export default function ShareablePitchCard({ 
  data, 
  variant = 'default',
  showStats = true,
  showActions = true
}: Props) {
  const {
    id,
    title,
    pitch_text,
    skills = [],
    location,
    job_type,
    availability,
    photo_url,
    likes_count,
    views_count,
    endorsements_count,
    supporters_count,
    user
  } = data

  const veteranName = user?.name || 'Veteran'

  // Truncate pitch text to ~120 characters for better visual balance
  const truncatedPitch = pitch_text?.length > 120 
    ? pitch_text.substring(0, 120) + '...' 
    : pitch_text

  return (
    <div 
      className={`
        group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden 
        hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 
        transform hover:-translate-y-1 hover:scale-[1.01]
        ${variant === 'featured' ? 'ring-2 ring-blue-500/20' : ''}
        ${variant === 'social' ? 'max-w-md mx-auto' : ''}
      `}
    >
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 md:p-8">
        {/* Header with Veteran Badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {photo_url ? (
              <div className="relative">
                <img 
                  src={photo_url} 
                  alt={veteranName}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover shadow-lg ring-4 ring-white"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white">
                  <Shield className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Award className="h-3 w-3 text-white" />
                </div>
              </div>
            )}
            <div>
              <div className="font-bold text-gray-900 text-base md:text-lg">{veteranName}</div>
              <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Verified Veteran
              </div>
            </div>
          </div>
          
          {/* Premium Badge */}
          {variant === 'featured' && (
            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-semibold">Featured</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>

        {/* Pitch Content - Value-focused */}
        <p className="text-gray-600 mb-6 leading-relaxed text-sm line-clamp-3">
          {truncatedPitch}
        </p>
        
        {/* Value Proposition */}
        <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Proven leadership • Mission-driven • Results-oriented</span>
          </div>
        </div>

        {/* Skills - Minimalist Design */}
        <div className="flex flex-wrap gap-2 mb-6">
          {skills.slice(0, 3).map((skill: string, index: number) => (
            <span 
              key={index} 
              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-3 py-1.5 bg-gray-50 text-gray-500 text-xs rounded-full font-medium">
              +{skills.length - 3} more
            </span>
          )}
        </div>

        {/* Location & Availability - Clean Layout */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
          {location && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">{location}</span>
            </div>
          )}
          {availability && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{availability}</span>
            </div>
          )}
          {job_type && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-purple-500" />
              <span className="font-medium capitalize">{job_type}</span>
            </div>
          )}
        </div>

        {/* Stats - Modern Card Design */}
        {showStats && (
          <div className="grid grid-cols-4 gap-2 mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-bold text-gray-900">{views_count}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">Views</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-lg font-bold text-gray-900">{likes_count}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">Likes</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold text-gray-900">{endorsements_count}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">Endorsed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-lg font-bold text-gray-900">{endorsements_count}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">Endorsed</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-3">
            <Link 
              href={`/pitch/${id}`}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View Full Profile
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Professional Badge */}
        {variant === 'social' && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
              <Shield className="h-3 w-3" />
              Verified Professional
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-500 pointer-events-none" />
    </div>
  )
}
