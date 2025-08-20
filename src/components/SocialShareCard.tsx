'use client'

import { useState, useRef } from 'react'
import { 
  Share2, 
  Download, 
  Copy, 
  Check,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Mail,
  Link as LinkIcon
} from 'lucide-react'
import html2canvas from 'html2canvas'

import type { PitchCardData } from '../../types/domain'
import ShareablePitchCard from './ShareablePitchCard'

type Props = { 
  data: PitchCardData;
  onClose?: () => void;
};

export default function SocialShareCard({ data, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const shareUrl = `${window.location.origin}/pitch/${data.id}`
  
  // Generate value-focused share text based on skills and experience
  const generateShareText = () => {
    const veteranName = data.user?.name || 'Veteran'
    const skills = data.skills?.slice(0, 2).join(', ') || 'Leadership'
    const experience = data.experience_years || 0
    const location = data.location || ''
    
    if (experience > 0) {
      return `${veteranName} | ${experience}+ years ${skills} | ${location} | Available now`
    } else {
      return `${veteranName} | ${skills} specialist | ${location} | Ready to deploy`
    }
  }
  
  const shareText = generateShareText()
  
  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-500 hover:bg-blue-50'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-700 hover:bg-blue-50'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`High-impact professional available for immediate deployment:\n\n${shareText}\n\nView full profile: ${shareUrl}`)}`,
      color: 'text-gray-600 hover:bg-gray-50'
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadImage = async () => {
    if (!cardRef.current) return
    
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const link = document.createElement('a')
      link.download = `professional-profile-${data.id}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Failed to download image:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Share Professional Profile</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
            <div ref={cardRef} className="transform scale-75 origin-top-left">
              <ShareablePitchCard 
                data={data} 
                variant="social" 
                showStats={true}
                showActions={false}
              />
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Share via</h4>
            
            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200 ${link.color}`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.name}</span>
                </a>
              ))}
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <LinkIcon className="h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>

            {/* Download Image */}
            <button
              onClick={downloadImage}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              {downloading ? 'Generating Image...' : 'Download as Image'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <p className="text-sm text-gray-600 text-center">
            Share this veteran's profile to help them connect with opportunities
          </p>
        </div>
      </div>
    </div>
  )
}
