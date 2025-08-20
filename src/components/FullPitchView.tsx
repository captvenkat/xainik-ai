'use client'

import { useState, useEffect } from 'react'
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
  Check,
  AlertTriangle,
  Zap,
  Target,
  Users,
  Timer
} from 'lucide-react'
import Link from 'next/link'
import LikeButton from '@/components/LikeButton'
import SocialShareCard from '@/components/SocialShareCard'
import ResumeRequestModal from '@/components/ResumeRequestModal'
import type { FullPitchData } from '@/types/domain'

interface FullPitchViewProps {
  pitch: FullPitchData
  currentUserId?: string
}

export default function FullPitchView({ pitch, currentUserId }: FullPitchViewProps) {
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ days: number } | null>(null)
  
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
    supporters_count,
    plan_tier,
    plan_expires_at,
    created_at,
    updated_at,
    endorsements,
    user
  } = pitch

  const veteranName = user?.name || 'Veteran'
  const veteranRole = 'veteran'

  // Countdown timer effect - updates daily
  useEffect(() => {
    if (!plan_expires_at) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(plan_expires_at).getTime()
      const difference = expiry - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24))
        })
      } else {
        setTimeLeft({ days: 0 })
      }
    }

    calculateTimeLeft()
    // Update once per day instead of every second
    const timer = setInterval(calculateTimeLeft, 24 * 60 * 60 * 1000)

    return () => clearInterval(timer)
  }, [plan_expires_at])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getUrgencyLevel = () => {
    if (!timeLeft) return 'normal'
    if (timeLeft.days <= 1) return 'critical'
    if (timeLeft.days <= 3) return 'urgent'
    if (timeLeft.days <= 7) return 'warning'
    return 'normal'
  }

  const getUrgencyMessage = () => {
    const level = getUrgencyLevel()
    switch (level) {
      case 'critical':
        return '🚨 CRITICAL: This pitch expires in less than 24 hours!'
      case 'urgent':
        return '⚡ URGENT: This pitch expires soon - act fast!'
      case 'warning':
        return '⚠️ LIMITED TIME: This pitch will expire soon'
      default:
        return '⏰ This pitch is active and ready for opportunities'
    }
  }

  const getUrgencyColor = () => {
    const level = getUrgencyLevel()
    switch (level) {
      case 'critical':
        return 'from-red-500 to-red-600'
      case 'urgent':
        return 'from-orange-500 to-red-500'
      case 'warning':
        return 'from-yellow-500 to-orange-500'
      default:
        return 'from-green-500 to-blue-500'
    }
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
      {/* Urgency Banner */}
      {timeLeft && (
        <div className={`mb-6 bg-gradient-to-r ${getUrgencyColor()} text-white rounded-2xl p-6 shadow-lg animate-pulse`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <h3 className="text-lg font-bold">{getUrgencyMessage()}</h3>
                <p className="text-sm opacity-90">Don't miss this opportunity - connect now!</p>
              </div>
            </div>
                         <div className="text-right">
               <div className="text-2xl font-bold">
                 {timeLeft.days} days
               </div>
               <div className="text-sm opacity-90">Remaining</div>
             </div>
          </div>
        </div>
      )}

      {/* Hero Section - Urgency Focused */}
      <div className="relative bg-gradient-to-br from-red-50 via-white to-orange-50 rounded-3xl p-8 md:p-12 mb-8 border-2 border-red-100 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-3xl" />
        
        <div className="relative">
          {/* Header with Urgency */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
            <div className="flex items-start gap-6">
              {/* Profile Image with Urgency Badge */}
              {photo_url ? (
                <div className="relative">
                  <img 
                    src={photo_url} 
                    alt={veteranName}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white">
                    <Shield className="h-12 w-12 md:h-16 md:w-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              {/* Title and Urgency Badges */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {title}
                </h1>
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-5 w-5" />
                    <span className="font-semibold text-lg">{veteranName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Verified Veteran</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 animate-pulse">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm font-semibold">Active Now</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Urgency Stats */}
            <div className="grid grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{views_count}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium text-center">People Watching</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{likes_count}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium text-center">Interested</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{endorsements_count}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium text-center">Endorsed</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{supporters_count}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium text-center">Supporting</div>
              </div>
            </div>
          </div>

          {/* Urgency Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {location && (
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Ready in</div>
                  <div className="font-semibold text-gray-900">{location}</div>
                </div>
              </div>
            )}
            {job_type && (
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
                <Target className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium">Seeking</div>
                  <div className="font-semibold text-gray-900 capitalize">{job_type}</div>
                </div>
              </div>
            )}
            {availability && (
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium">Available</div>
                  <div className="font-semibold text-gray-900">{availability}</div>
                </div>
              </div>
            )}
            {experience_years && (
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm">
                <Award className="h-5 w-5 text-purple-500" />
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
              <Target className="h-5 w-5 text-red-500" />
              Core Competencies
            </h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill: string, index: number) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 rounded-full border border-red-100 font-medium hover:from-red-100 hover:to-orange-100 transition-all duration-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Pitch */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Pitch
            </h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">{pitch_text}</p>
            </div>
          </div>

                           {/* Bio Section */}
                 {pitch.veterans?.[0]?.bio && (
                   <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                     <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                       <User className="h-5 w-5 text-green-500" />
                       About {veteranName}
                     </h3>
                     <div className="prose prose-gray max-w-none">
                       <p className="text-gray-700 leading-relaxed text-lg">{pitch.veterans[0].bio}</p>
                     </div>
                   </div>
                 )}

          {/* Endorsements */}
          {endorsements && endorsements.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Community Validation
              </h3>
              <div className="space-y-4">
                {endorsements.slice(0, 5).map((endorsement, index) => (
                  <div key={(endorsement as any).id || `endorsement-${index}`} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
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
          {/* Urgency CTA */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 text-white shadow-lg">
            <div className="text-center">
              <h4 className="text-lg font-bold mb-2">⚡ Act Fast!</h4>
              <p className="text-sm opacity-90 mb-4">This veteran is actively seeking opportunities</p>
              <div className="text-2xl font-bold mb-2">
                {views_count} people viewing
              </div>
              <div className="text-sm opacity-90">
                Don't miss this opportunity!
              </div>
            </div>
          </div>

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
            <h4 className="text-lg font-bold text-gray-900 mb-4">🚀 Connect Now</h4>
            
            {/* Edit Button (only for pitch owner) */}
            {currentUserId && user?.id === currentUserId && (
              <Link
                href={`/pitch/${id}/edit`}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Eye className="h-5 w-5" />
                Edit Pitch
              </Link>
            )}
            
            {/* Contact Button */}
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Phone className="h-5 w-5" />
              {showContactInfo ? 'Hide Contact' : 'Get Contact Info'}
            </button>

            {/* Resume Request */}
            {resume_url && resume_share_enabled && (
              <button
                onClick={() => setShowResumeModal(true)}
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
              Share Pitch
            </button>
          </div>

          {/* Contact Information */}
          {showContactInfo && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-red-500" />
                Contact Information
              </h4>
              <div className="space-y-4">
                {/* Direct Call Button */}
                {phone && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-white">
                      <Phone className="h-5 w-5 text-red-500" />
                      <span className="text-gray-700 font-medium">{phone}</span>
                    </div>
                    <button
                      onClick={() => window.open(`tel:${phone}`, '_self')}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Phone className="h-4 w-4" />
                      Call Now
                    </button>
                  </div>
                )}
                
                {/* Email Section */}
                {user?.email && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/80 rounded-2xl border border-white">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700 font-medium">{user.email}</span>
                      </div>
                      <button
                        onClick={copyEmail}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        {copiedEmail ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => window.open(`mailto:${user.email}?subject=Interested in your pitch - ${title}`, '_self')}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Mail className="h-4 w-4" />
                      Send Email
                    </button>
                  </div>
                )}
                
                {/* Location */}
                {location && (
                  <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-white">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    <span className="text-gray-700 font-medium">{location}</span>
                  </div>
                )}
                
                {/* Availability */}
                {availability && (
                  <div className="flex items-center gap-3 p-3 bg-white/80 rounded-2xl border border-white">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-gray-700 font-medium">Available: {availability}</span>
                  </div>
                )}
              </div>
            </div>
          )}
           
           {/* Pitch Info */}
           <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
             <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Pitch Analytics</h4>
             <div className="space-y-3 text-sm text-gray-600">
               <div className="flex justify-between">
                 <span>Created</span>
                 <span className="font-medium">{formatDate(created_at)}</span>
               </div>
               <div className="flex justify-between">
                 <span>Last Updated</span>
                 <span className="font-medium">{formatDate(updated_at)}</span>
               </div>
               <div className="flex justify-between">
                 <span>Engagement Rate</span>
                 <span className="font-medium text-green-600">
                   {views_count > 0 ? Math.round((likes_count / views_count) * 100) : 0}%
                 </span>
               </div>
               <div className="flex justify-between">
                 <span>Response Time</span>
                 <span className="font-medium text-green-600">Within 24h</span>
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* Share Modal */}
       {showShareModal && (
         <SocialShareCard
           pitch={pitch}
           onClose={() => setShowShareModal(false)}
         />
       )}

       {/* Resume Request Modal */}
       <ResumeRequestModal
         isOpen={showResumeModal}
         onClose={() => setShowResumeModal(false)}
         veteranName={veteranName}
         pitchId={id}
         currentUserId={currentUserId}
       />
     </div>
   )
 }
