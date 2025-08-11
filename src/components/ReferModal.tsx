"use client"

import { useState, useEffect } from 'react'
import { Share2, Copy, ExternalLink, MessageCircle, Linkedin, Mail } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { createOrGetReferral, trackReferralEvent } from '@/lib/referrals'

interface ReferModalProps {
  pitchId: string
  pitchTitle: string
  veteranName: string
  userId: string
  onClose: () => void
}

export default function ReferModal({ 
  pitchId, 
  pitchTitle, 
  veteranName, 
  userId,
  onClose 
}: ReferModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [referralLink, setReferralLink] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createSupabaseBrowser()
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      setUserRole(profile?.role || null)
    }

    checkUserRole()
  }, [userId])

  const generateReferralLink = async (platform: string) => {
    if (userRole !== 'supporter') {
      setError('Only supporters can generate referral links')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const link = await createOrGetReferral(userId, pitchId)
      setReferralLink(link)

      // Log referral generation event
      await trackReferralEvent({
        referral_id: `${userId}_${pitchId}`,
        event_type: 'LINK_OPENED',
        platform,
        user_agent: navigator.userAgent,
        ip_hash: 'client-side'
      })

      return link
    } catch (err: any) {
      setError(err.message || 'Failed to generate referral link')
      return null
    } finally {
      setLoading(false)
    }
  }

  const createShareUrl = (platform: string) => {
    if (!referralLink) return '#'
    
    const message = `Check out this veteran's pitch: ${pitchTitle} by ${veteranName}`
    
    switch (platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralLink)}`
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`
      case 'email':
        return `mailto:?subject=${encodeURIComponent('Veteran Pitch Referral')}&body=${encodeURIComponent(message + '\n\n' + referralLink)}`
      case 'copy':
        return referralLink
      default:
        return referralLink
    }
  }

  const handleShare = async (platform: string) => {
    if (!referralLink) {
      const link = await generateReferralLink(platform)
      if (!link) return
    }

    const shareUrl = createShareUrl(platform)
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl)
      setCopied('copy')
      setTimeout(() => setCopied(null), 2000)
    } else {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }

    // Log share event
    if (referralLink) {
      try {
        await trackReferralEvent({
          referral_id: `${userId}_${pitchId}`,
          event_type: 'SHARE_RESHARED',
          platform,
          user_agent: navigator.userAgent,
          ip_hash: 'client-side'
        })
      } catch (error) {
      }
    }
  }

  const shareButtons = [
    {
      platform: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      platform: 'email',
      label: 'Email',
      icon: Mail,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      platform: 'copy',
      label: copied === 'copy' ? 'Copied!' : 'Copy Link',
      icon: Copy,
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Share Veteran's Pitch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-2">Share this veteran's pitch with your network:</p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{pitchTitle}</p>
            <p className="text-sm text-gray-600">by {veteranName}</p>
          </div>
        </div>

        {userRole !== 'supporter' ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">You need to be a supporter to generate referral links</p>
            <a
              href="/auth?role=supporter&redirectTo=/supporter/refer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Become a Supporter
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {shareButtons.map(({ platform, label, icon: Icon, color }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  disabled={loading}
                  className={`${color} text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {referralLink && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Referral Link:</strong> {referralLink}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Track clicks and conversions in your supporter dashboard
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sharing helps veterans find opportunities and supports our mission
          </p>
        </div>
      </div>
    </div>
  )
}
