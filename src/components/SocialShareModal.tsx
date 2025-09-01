'use client'

import { useState } from 'react'

interface SocialShareModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShareOption {
  name: string
  icon: string
  color: string
  action: () => void
  message: string
}

export default function SocialShareModal({ isOpen, onClose }: SocialShareModalProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)

  if (!isOpen) return null

  const shareData = {
    title: 'Xainik - Veteran Success Foundation',
    text: 'Our soldiers stood for us. Today I stood for them. Backed Xainik, an AI-first nonprofit helping veterans build their second innings. You can too!',
    url: 'https://xainik.com',
    hashtags: 'VeteranSuccess, IndianMilitary, SupportOurHeroes, Xainik'
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopiedPlatform('copy')
      setTimeout(() => setCopiedPlatform(null), 2000)
    } catch (error) {
      alert('Please manually copy: https://xainik.com')
    }
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleTelegramShare = () => {
    const message = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`, '_blank')
  }

  const handleTwitterShare = () => {
    const message = encodeURIComponent(`${shareData.text} ${shareData.hashtags}`)
    window.open(`https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(shareData.url)}`, '_blank')
  }

  const handleLinkedInShare = () => {
    const message = encodeURIComponent(`${shareData.text}`)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${message}`, '_blank')
  }

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`, '_blank')
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Support Indian Military Veterans - Xainik')
    const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}\n\nJoin me in supporting our heroes!`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const handleSMSShare = () => {
    const message = encodeURIComponent(`${shareData.text} ${shareData.url}`)
    window.open(`sms:?body=${message}`, '_blank')
  }

  const shareOptions: ShareOption[] = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      action: handleWhatsAppShare,
      message: 'Share on WhatsApp'
    },
    {
      name: 'Telegram',
      icon: '📱',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: handleTelegramShare,
      message: 'Share on Telegram'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-sky-500 hover:bg-sky-600',
      action: handleTwitterShare,
      message: 'Share on Twitter'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: handleLinkedInShare,
      message: 'Share on LinkedIn'
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-700 hover:bg-blue-800',
      action: handleFacebookShare,
      message: 'Share on Facebook'
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'bg-gray-600 hover:bg-gray-700',
      action: handleEmailShare,
      message: 'Share via Email'
    },
    {
      name: 'SMS',
      icon: '📱',
      color: 'bg-green-600 hover:bg-green-700',
      action: handleSMSShare,
      message: 'Share via SMS'
    },
    {
      name: 'Copy Link',
      icon: copiedPlatform === 'copy' ? '✅' : '🔗',
      color: copiedPlatform === 'copy' ? 'bg-military-green' : 'bg-military-gold hover:bg-yellow-500',
      action: handleCopyLink,
      message: copiedPlatform === 'copy' ? 'Link Copied!' : 'Copy Link'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-premium-black border border-military-gold/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="military-badge mx-auto mb-4">
            🚀
          </div>
          <h2 className="premium-heading text-2xl md:text-3xl mb-3 text-premium-white">
            Share This Mission
          </h2>
          <p className="text-gray-300 text-lg">
            Help us reach more people who can support our veterans
          </p>
        </div>

        {/* Pre-built Message Preview */}
        <div className="bg-premium-gray/30 border border-military-gold/20 rounded-2xl p-6 mb-8">
          <h3 className="text-military-gold font-semibold mb-3 text-center">Your Message Will Look Like This:</h3>
          <div className="bg-premium-gray/50 rounded-xl p-4 border border-military-gold/10">
            <p className="text-premium-white text-sm leading-relaxed">
              {shareData.text}
            </p>
            <div className="mt-3 pt-3 border-t border-military-gold/20">
              <span className="text-military-gold text-sm font-medium">Link: </span>
              <span className="text-gray-400 text-sm">{shareData.url}</span>
            </div>
          </div>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className={`${option.color} text-white font-semibold py-4 px-3 rounded-2xl transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-xs text-center">{option.message}</span>
            </button>
          ))}
        </div>

        {/* Viral Call to Action */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-premium-gray/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-military-gold/30">
            <span className="text-military-gold text-xl">🌟</span>
            <span className="text-premium-white font-medium">Every share helps a veteran succeed!</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-transparent border-2 border-military-gold text-military-gold font-semibold rounded-2xl hover:bg-military-gold hover:text-black transition-all duration-300"
          >
            Close
          </button>
        </div>

        {/* Success Message */}
        {copiedPlatform && (
          <div className="fixed top-4 right-4 bg-military-green text-black px-6 py-3 rounded-2xl shadow-lg animate-slide-in">
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span>Link copied to clipboard!</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
