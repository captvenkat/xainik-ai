'use client'

import { useState } from 'react'
import { Share2, Copy, ExternalLink, MessageCircle, Linkedin, Mail, X } from 'lucide-react'
import ReferModal from '../ReferModal'

interface ShareModalProps {
  pitchId: string
  pitchTitle: string
  veteranName: string
  userId: string
  onClose: () => void
}

export default function ShareModal({ pitchId, pitchTitle, veteranName, userId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleShare = async (platform: string) => {
    const message = `Check out this veteran's pitch: ${pitchTitle} by ${veteranName}`
    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pitch/${pitchId}`
    
    let url: string
    
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Veteran Pitch Referral')}&body=${encodeURIComponent(message + '\n\n' + shareUrl)}`
        break
      case 'copy':
        await navigator.clipboard.writeText(shareUrl)
        setCopied('copy')
        setTimeout(() => setCopied(null), 2000)
        return
      default:
        url = shareUrl
    }
    
    window.open(url, '_blank', 'noopener,noreferrer')
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
          <h2 className="text-xl font-semibold text-gray-900">Share Your Pitch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-2">Share your pitch with your network:</p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{pitchTitle}</p>
            <p className="text-sm text-gray-600">by {veteranName}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {shareButtons.map(({ platform, label, icon: Icon, color }) => (
              <button
                key={platform}
                onClick={() => handleShare(platform)}
                className={`${color} text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sharing helps increase visibility and opportunities
          </p>
        </div>
      </div>
    </div>
  )
}
