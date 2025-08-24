'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, CheckCircle, Eye, Heart, TrendingUp, Users, MapPin, Calendar, 
  Phone, LinkIcon, FileText, Star, User, Zap, MessageSquare, 
  Target, Users as UsersIcon, Timer, MessageSquare as MessageSquareIcon,
  Briefcase, Activity
} from 'lucide-react'
import Link from 'next/link'
import ResumeRequestModal from '@/components/ResumeRequestModal'

import type { FullPitchData } from '@/types/domain'

interface FullPitchViewProps {
  pitch: FullPitchData
  user?: any
  endorsements?: any[]
  isCommunityVerified?: boolean
}

export default function FullPitchView({ 
  pitch, 
  user, 
  endorsements, 
  isCommunityVerified 
}: FullPitchViewProps) {
  const [showResumeModal, setShowResumeModal] = useState(false)
  
  // Comprehensive debugging - log all incoming props
  console.log('FullPitchView Props Debug:', {
    pitch: {
      id: pitch.id,
      title: pitch.title,
      user: pitch.user,
      militaryData: (pitch as any).militaryData,
      bio: (pitch as any).bio
    },
    user,
    endorsements,
    isCommunityVerified,
    fullPitchObject: pitch
  })
  
  const {
    id,
    title,
    pitch_text,
    skills = [],
    location,
    job_type,
    availability,
    photo_url,
    phone,
    linkedin_url,
    resume_url,
    resume_share_enabled,
    plan_tier,
    plan_expires_at,
    likes_count,
    views_count,
    endorsements_count,
    supporters_count,
    created_at,
    updated_at,
    user: pitchUser,
    militaryData,
    bio
  } = pitch

  // Additional debugging for military data
  console.log('FullPitchView Military Data Debug:', {
    militaryData,
    militaryDataType: typeof militaryData,
    militaryDataKeys: militaryData ? Object.keys(militaryData) : 'undefined',
    bio,
    bioType: typeof bio,
    pitchKeys: Object.keys(pitch)
  })

  const veteranName = pitchUser?.name || 'Veteran'
  const veteranRole = 'veteran'

  // Format military service information
  const militaryRank = militaryData?.rank || 'Not specified'
  const serviceBranch = militaryData?.service_branch || 'Not specified'
  const yearsOfService = militaryData?.years_experience || 0

  // Debug logging
  console.log('FullPitchView Debug:', {
    militaryData,
    bio: pitch.bio,
    resume_url,
    resume_share_enabled,
    user: user?.id,
    pitchUser: pitchUser?.id
  })

  // Calculate time since creation
  const timeSinceCreation = created_at 
    ? Math.floor((Date.now() - new Date(created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 to-blue-100/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZWNhY2EiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            {/* Veteran Photo and Basic Info */}
            <div className="flex flex-col items-center mb-8">
              {photo_url ? (
                <div className="relative mb-6">
                  <img 
                    src={photo_url} 
                    alt={veteranName}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white mb-6">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              )}

              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {veteranName}
                </h1>
                
                {/* Military Service Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-blue-100 px-4 py-2 rounded-full border border-red-200 mb-3">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {militaryRank} • {serviceBranch} • {yearsOfService} years
                  </span>
                </div>

                {/* Verified Veteran Tag */}
                {isCommunityVerified && (
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 mb-3">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Verified Veteran</span>
                  </div>
                )}

                {/* Pitch Title */}
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
                  {title}
                </h2>

                {/* Location and Availability */}
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Available: {availability}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Redesigned Metrics Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{views_count || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Profile Views</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{likes_count || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Interested</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{endorsements_count || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Endorsed</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{supporters_count || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Supporting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            {pitch.bio && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  About {veteranName}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">{pitch.bio}</p>
                </div>
              </div>
            )}

            {/* Pitch Content */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Professional Pitch
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{pitch_text}</p>
              </div>
            </div>

            {/* Skills Section */}
            {skills && skills.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Core Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full border border-blue-200 font-medium text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Endorsements Section */}
            {endorsements && endorsements.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Community Endorsements ({endorsements.length})
                </h3>
                <div className="space-y-4">
                  {endorsements.map((endorsement, index) => (
                    <div key={index} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {endorsement.endorser?.name || 'Community Member'}
                          </div>
                          <p className="text-gray-700 text-sm">{endorsement.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Military Service Information */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Military Service
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rank</span>
                  <span className="font-semibold text-gray-900">{militaryRank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Service Branch</span>
                  <span className="font-semibold text-gray-900">{serviceBranch}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Years of Service</span>
                  <span className="font-semibold text-gray-900">{yearsOfService} years</span>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Job Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Job Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{job_type?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="font-semibold text-gray-900">{pitch.experience_years || 0} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location</span>
                  <span className="font-semibold text-gray-900">{location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Availability</span>
                  <span className="font-semibold text-gray-900">{availability}</span>
                </div>
              </div>
            </div>

            {/* Contact & Additional Details */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                Contact & Details
              </h3>
              <div className="space-y-4">
                {phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Phone</div>
                      <div className="font-semibold text-gray-900">Available for Contact</div>
                    </div>
                  </div>
                )}
                {linkedin_url && (
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500 font-medium">LinkedIn</div>
                      <a 
                        href={linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                )}
                {resume_url && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Resume</div>
                      <div className="font-semibold text-gray-900">
                        {resume_share_enabled ? 'Available on Request' : 'Not Available'}
                      </div>
                    </div>
                  </div>
                )}
                {plan_tier && plan_tier !== 'free' && (
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Plan</div>
                      <div className="font-semibold text-gray-900 capitalize">{plan_tier.replace('_', ' ')}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contact Actions */}
              {(phone || linkedin_url) && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Options</h4>
                  <div className="flex flex-col gap-2">
                    {phone && (
                      <button
                        onClick={() => window.open(`tel:${phone}`, '_blank')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                    )}
                    {linkedin_url && (
                      <a
                        href={linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <LinkIcon className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Request Button */}
              {resume_url && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowResumeModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FileText className="h-4 w-4" />
                    Request Resume
                  </button>
                </div>
              )}
            </div>

            {/* Pitch Activity */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Pitch Activity
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {timeSinceCreation === 0 ? 'Today' : `${timeSinceCreation} days ago`}
                  </span>
                </div>
                {updated_at && updated_at !== created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {Math.floor((Date.now() - new Date(updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Request Modal */}
      <ResumeRequestModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        veteranName={veteranName}
        pitchId={id}
        currentUserId={user?.id}
      />
    </div>
  )
}
