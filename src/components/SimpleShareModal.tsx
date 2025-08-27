'use client'

import { useState, useEffect } from 'react'
import { X, Share2, MessageCircle, Linkedin, Mail, Copy, Check, ExternalLink, Globe, Twitter, Facebook } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { tracking } from '@/lib/tracking'

interface SimpleShareModalProps {
  isOpen: boolean
  onClose: () => void
  pitchId: string
  pitchTitle: string
  veteranName: string
  userId: string
}

export default function SimpleShareModal({ 
  isOpen, 
  onClose, 
  pitchId, 
  pitchTitle, 
  veteranName, 
  userId 
}: SimpleShareModalProps) {
  const [shareLink, setShareLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Simple, smart message that works for any platform
  const smartMessage = `🚀 Check out this veteran's pitch: "${pitchTitle}" by ${veteranName}. Help them find their next mission!`

  useEffect(() => {
    if (isOpen && pitchId) {
      createShareLink()
    }
  }, [isOpen, pitchId])

  const createShareLink = async () => {
    setLoading(true)
    try {
      const supabase = createSupabaseBrowser()
      
      // Create or get referral
      const { data: referral, error } = await supabase
        .from('referrals')
        .upsert({
          user_id: userId,
          pitch_id: pitchId,
          share_link: `share-${pitchId}-${Date.now()}`,
          platform: 'web'
        }, {
          onConflict: 'user_id,pitch_id'
        })
        .select('id, share_link')
        .single()

      if (error) {
        console.error('Error creating referral:', error)
        // Fallback to direct link
        setShareLink(`${window.location.origin}/pitch/${pitchId}`)
      } else {
        setShareLink(`${window.location.origin}/pitch/${pitchId}?ref=${referral.id}`)
      }
    } catch (error) {
      console.error('Error creating share link:', error)
      setShareLink(`${window.location.origin}/pitch/${pitchId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (platform: string) => {
    if (!shareLink) return

    let shareUrl = ''
    const fullMessage = `${smartMessage}\n\n${shareLink}`

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(`Veteran Pitch: ${pitchTitle}`)}&summary=${encodeURIComponent(smartMessage)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`Veteran Referral: ${veteranName}`)}&body=${encodeURIComponent(fullMessage)}`
        break
      case 'web':
        shareUrl = shareLink
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullMessage)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(smartMessage)}`
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareLink)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (error) {
          console.error('Error copying to clipboard:', error)
        }
        return
      default:
        shareUrl = shareLink
    }

    // Track the share event
    try {
      await tracking.shareClicked(pitchId, undefined, undefined, platform)
    } catch (error) {
      console.error('Error tracking share:', error)
    }

    // Open share URL
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const shareOptions = [
    {
      platform: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Share with friends & family'
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Share with professional network'
    },
    {
      platform: 'email',
      label: 'Email',
      icon: Mail,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Send via email'
    },
    {
      platform: 'web',
      label: 'Web',
      icon: Globe,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Share on web platforms'
    },
    {
      platform: 'twitter',
      label: 'Twitter (X)',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      description: 'Share on Twitter/X'
    },
    {
      platform: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-700 hover:bg-blue-800',
      description: 'Share on Facebook'
    },
    {
      platform: 'copy',
      label: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? Check : Copy,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Copy link to clipboard'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Share Pitch</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pitch Preview */}
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="font-medium text-gray-900 mb-1">{pitchTitle}</p>
            <p className="text-sm text-gray-600">by {veteranName}</p>
          </div>
        </div>

        {/* Smart Message */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Message:</p>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-800">{smartMessage}</p>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          {shareOptions.map(({ platform, label, icon: Icon, color, description }) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              disabled={loading}
              className={`${color} text-white w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-between group`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs opacity-90">{description}</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sharing helps veterans find opportunities faster 🚀
          </p>
        </div>
      </div>
    </div>
  )
}
