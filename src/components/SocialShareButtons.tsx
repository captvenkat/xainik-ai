'use client'

import { useState } from 'react'
import { Share2, Linkedin, Twitter, MessageCircle, Mail, Copy, Check } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface SocialShareButtonsProps {
  pitchId: string
  pitchTitle: string
  pitchText: string
  veteranName: string
  userId?: string // Pitch owner's user_id for tracking (optional)
  className?: string
}

export default function SocialShareButtons({ 
  pitchId, 
  pitchTitle, 
  pitchText, 
  veteranName, 
  userId,
  className = '' 
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const pitchUrl = `${window.location.origin}/pitch/${pitchId}`
  const shareText = `Check out ${veteranName}'s pitch: ${pitchTitle}`
  const fullShareText = `${shareText}\n\n${pitchText.substring(0, 100)}...\n\n${pitchUrl}`

  const trackShare = async (platform: string) => {
    try {
      const supabase = createSupabaseBrowser()
      await supabase.from('tracking_events').insert({
        event_type: 'SHARE_RESHARED',
        pitch_id: pitchId,
        user_id: userId || null, // Pitch owner's user_id for tracking (optional)
        platform: platform.toLowerCase(),
        user_agent: navigator.userAgent,
        ip_address: 'client-side',
        session_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata: { 
          platform, 
          pitch_id: pitchId,
          source: 'SocialShareButtons'
        },
        occurred_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error tracking share:', error)
    }
  }

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pitchUrl)}&title=${encodeURIComponent(shareText)}`
    window.open(linkedInUrl, '_blank', 'width=600,height=400')
    trackShare('linkedin')
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    trackShare('twitter')
  }

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`
    window.open(whatsappUrl, '_blank')
    trackShare('whatsapp')
  }

  const shareViaEmail = () => {
    const emailSubject = `Check out ${veteranName}'s pitch`
    const emailBody = `Hi,\n\nI wanted to share ${veteranName}'s pitch with you:\n\n${pitchTitle}\n\n${pitchText}\n\nView the full pitch here: ${pitchUrl}\n\nBest regards`
    const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.open(emailUrl)
    trackShare('email')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pitchUrl)
      setCopied(true)
      trackShare('copy')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  const handleShare = async (platform: string) => {
    setIsSharing(true)
    try {
      switch (platform) {
        case 'linkedin':
          shareToLinkedIn()
          break
        case 'twitter':
          shareToTwitter()
          break
        case 'whatsapp':
          shareToWhatsApp()
          break
        case 'email':
          shareViaEmail()
          break
        case 'copy':
          await copyLink()
          break
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => handleShare('linkedin')}
        disabled={isSharing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </button>

      <button
        onClick={() => handleShare('twitter')}
        disabled={isSharing}
        className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
        title="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
        <span className="hidden sm:inline">Twitter</span>
      </button>

      <button
        onClick={() => handleShare('whatsapp')}
        disabled={isSharing}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        title="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>

      <button
        onClick={() => handleShare('email')}
        disabled={isSharing}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        title="Share via Email"
      >
        <Mail className="w-4 h-4" />
        <span className="hidden sm:inline">Email</span>
      </button>

      <button
        onClick={() => handleShare('copy')}
        disabled={isSharing}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        title="Copy Link"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  )
}
