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
  MessageCircle,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Mail,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import Link from 'next/link'
import LikeButton from '@/components/LikeButton'
import SocialShareCard from '@/components/SocialShareCard'
import type { FullPitchData } from '@/types/domain'

interface FullPitchViewProps {
  pitch: FullPitchData
  onContact?: () => void
  onRequestResume?: () => void
  currentUserId?: string
}

export default function FullPitchView({ pitch, onContact, onRequestResume, currentUserId }: FullPitchViewProps) {
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  
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
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
        <Star className="h-3 w-3 mr-1 fill-current" />
        Premium
      </span>
    }
    if (plan_tier === 'enterprise') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
        <Award className="h-3 w-3 mr-1" />
        Enterprise
      </span>
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      Free
    </span>
  }

  const copyEmail = async () => {
    if (user?.email) {
      await navigator.clipboard.writeText(user.email)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl p-8 md:p-12 mb-8 border border-gray-100 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
            <div className="flex items-start gap-6">
              {/* Profile Image */}
              {photo_url ? (
                <div className="relative">
                  <img 
                    src={photo_url} 
                    alt={veteranName}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white">
                    <Shield className="h-12 w-12 md:h-16 md:w-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              {/* Title and Badges */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {title}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-5 w-5" />
                    <span className="font-semibold text-lg">{veteranName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Verified Veteran</span>
                  </div>
                  {getPlanBadge()}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{views_count}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium text-center">Profile Views</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{likes_count}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium text-center">Likes</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{endorsements_count}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium text-center">Endorsed</div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {location && (
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Location</div>
                  <div className="font-semibold text-gray-900">{location}</div>
                </div>
              </div>
            )}
            {job_type && (
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium">Job Type</div>
                  <div className="font-semibold text-gray-900 capitalize">{job_type}</div>
                </div>
              </div>
            )}
            {availability && (
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium">Availability</div>
                  <div className="font-semibold text-gray-900">{availability}</div>
                </div>
              </div>
            )}
            {experience_years && (
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
                <Award className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium">Experience</div>
                  <div className="font-semibold text-gray-900">{experience_years} years</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Skills Section */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill: string, index: number) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-100 font-medium hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Professional Summary
            </h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">{pitch_text}</p>
            </div>
          </div>

          {/* Endorsements */}
          {endorsements && endorsements.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Community Endorsements
              </h3>
              <div className="space-y-4">
                {endorsements.slice(0, 5).map((endorsement, index) => (
                  <div key={(endorsement as any).id || `endorsement-${index}`} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 text-lg leading-relaxed mb-3">
                          {(endorsement as any).text || 'Endorsement text not available'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="font-semibold text-gray-900">
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
        </div>

        {/* Right Column - Actions & Contact */}
        <div className="space-y-6">
          {/* Like Button */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center">
              <LikeButton 
                pitchId={id} 
                initialCount={likes_count}
                userId={user?.id}
              />
            </div>
          </div>

          {/* Contact & Actions */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Get in Touch</h4>
            
            {/* Edit Button (only for pitch owner) */}
            {currentUserId && user?.id === currentUserId && (
              <Link
                href={`/pitch/${id}/edit`}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Eye className="h-5 w-5" />
                Edit Profile
              </Link>
            )}

            {/* Contact Button */}
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Phone className="h-5 w-5" />
              {showContactInfo ? 'Hide Contact' : 'Show Contact Info'}
            </button>

            {/* Resume Request */}
            {resume_url && resume_share_enabled && (
              <button
                onClick={onRequestResume}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ExternalLink className="h-5 w-5" />
                View LinkedIn
              </Link>
            )}

            {/* Share */}
            <button 
              onClick={() => setShowShareModal(true)}
              className="w-full bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Share2 className="h-5 w-5" />
              Share Profile
            </button>
          </div>

          {/* Contact Information */}
          {showContactInfo && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Contact Information
              </h4>
              <div className="space-y-4">
                {phone && (
                  <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-white">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">{phone}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center justify-between p-3 bg-white/80 rounded-2xl border border-white">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700 font-medium">{user.email}</span>
                    </div>
                    <button
                      onClick={copyEmail}
                      className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      {copiedEmail ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-white">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    <span className="text-gray-700 font-medium">{location}</span>
                  </div>
                )}
                {availability && (
                  <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-white">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-gray-700 font-medium">Available: {availability}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Info */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Profile Info</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="font-medium">{formatDate(created_at)}</span>
              </div>
              {updated_at !== created_at && (
                <div className="flex justify-between">
                  <span>Updated</span>
                  <span className="font-medium">{formatDate(updated_at)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-medium capitalize">{plan_tier || 'Free'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Modal */}
      {showShareModal && (
        <SocialShareCard 
          data={pitch}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
