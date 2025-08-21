'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Copy, Check, MessageCircle, Users, Briefcase, Globe, Send, Sparkles, Target, Zap, ExternalLink, MessageSquare, Linkedin, Twitter, Facebook, Instagram, Youtube, Github, Heart, Star, Award } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { createOrGetReferralClient, trackReferralShareClient } from '@/lib/referrals-client'

interface SupporterShareModalProps {
  isOpen: boolean
  onClose: () => void
  supporterId: string
  pitchId: string
  pitchTitle: string
  veteranName: string
  veteranRank?: string
  veteranSkills?: string[]
  veteranLocation?: string
  veteranJobType?: string
  veteranAvailability?: string
}

interface ShareTemplate {
  id: string
  name: string
  icon: any
  description: string
  platforms: Platform[]
  autoMessage: (pitch: any, supporterName: string) => string
  customFields?: {
    label: string
    type: 'text' | 'email' | 'textarea'
    placeholder: string
    required: boolean
  }[]
}

interface Platform {
  id: string
  name: string
  icon: any
  color: string
  description: string
  shareUrl?: string
  characterLimit?: number
  features: string[]
}

export default function SupporterShareModal({ 
  isOpen, 
  onClose, 
  supporterId, 
  pitchId, 
  pitchTitle, 
  veteranName, 
  veteranRank,
  veteranSkills = [],
  veteranLocation = '',
  veteranJobType = '',
  veteranAvailability = ''
}: SupporterShareModalProps) {
  const [supporterName, setSupporterName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewMessage, setPreviewMessage] = useState('')
  const [platformMessage, setPlatformMessage] = useState('')
  const [shareLink, setShareLink] = useState('')

  // Platform definitions - Supporter-focused platforms
  const platforms: Platform[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-600',
      description: 'Professional networking platform',
      shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
      characterLimit: 3000,
      features: ['Professional networking', 'Job opportunities', 'Industry connections', 'Company research']
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600',
      description: 'Direct email communication',
      characterLimit: 10000,
      features: ['Direct communication', 'Professional tone', 'Detailed messaging', 'File attachments']
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-green-500',
      description: 'Instant messaging',
      characterLimit: 1000,
      features: ['Personal connections', 'Quick sharing', 'Group chats', 'Voice messages']
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: MessageCircle,
      color: 'bg-blue-500',
      description: 'Secure messaging platform',
      characterLimit: 4096,
      features: ['Secure messaging', 'Group channels', 'File sharing', 'Professional groups']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-500',
      description: 'Social networking',
      shareUrl: 'https://www.facebook.com/sharer/sharer.php',
      characterLimit: 63206,
      features: ['Personal network', 'Professional groups', 'Community sharing', 'Visual content']
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'bg-black',
      description: 'Social media platform',
      shareUrl: 'https://twitter.com/intent/tweet',
      characterLimit: 280,
      features: ['Quick sharing', 'Hashtag reach', 'Industry conversations', 'Networking']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-500',
      description: 'Visual social platform',
      characterLimit: 2200,
      features: ['Visual storytelling', 'Professional branding', 'Industry hashtags', 'Story sharing']
    }
  ]

  // World-class copywriting templates - Supporter's voice, referral tone, impressive format
  const shareTemplates: ShareTemplate[] = [
    {
      id: 'impressive-referral',
      name: 'Impressive Referral',
      icon: Star,
      description: 'Professional referral highlighting veteran\'s exceptional qualities',
      platforms: platforms.filter(p => ['linkedin', 'email', 'telegram'].includes(p.id)),
      autoMessage: (pitch, supporterName) => `Hi [Contact Name],

I wanted to personally refer an exceptional military veteran I know - ${veteranRank || 'Veteran'} ${veteranName}.

${veteranName} is a ${veteranJobType} professional with expertise in ${veteranSkills?.slice(0, 3).join(', ')}. What impresses me most is their leadership experience managing teams under pressure and delivering results in challenging environments.

They're available for ${veteranAvailability} opportunities and I believe they would be an asset to any organization.

Here's their professional pitch: [PITCH_LINK]

I'd be happy to connect you directly if you're interested.

Best regards,
${supporterName}`,
      customFields: [
        {
          label: 'Contact Name',
          type: 'text',
          placeholder: 'Enter contact name',
          required: true
        },
        {
          label: 'Company/Organization',
          type: 'text',
          placeholder: 'Enter company name',
          required: false
        },
        {
          label: 'Why You\'re Referring',
          type: 'textarea',
          placeholder: 'What specific qualities impressed you about this veteran?',
          required: false
        }
      ]
    },
    {
      id: 'network-connection',
      name: 'Network Connection',
      icon: Users,
      description: 'Connecting veteran with your professional network',
      platforms: platforms.filter(p => ['whatsapp', 'telegram', 'email', 'linkedin'].includes(p.id)),
      autoMessage: (pitch, supporterName) => `Hi [Network Contact],

I hope you're doing well! I wanted to connect you with ${veteranRank || 'Veteran'} ${veteranName}, a military veteran I've had the privilege of supporting.

${veteranName} is looking for ${veteranJobType} opportunities and has impressive skills in ${veteranSkills?.slice(0, 2).join(' and ')}. Their military background brings unique leadership, problem-solving, and team management capabilities.

They're available ${veteranAvailability} and I think they could be valuable to your network or organization.

Check out their pitch: [PITCH_LINK]

Would you be open to connecting with them or sharing this within your network?

Thanks!
${supporterName}`,
      customFields: [
        {
          label: 'Network Contact',
          type: 'text',
          placeholder: 'Enter contact name',
          required: true
        },
        {
          label: 'Your Relationship',
          type: 'text',
          placeholder: 'e.g., Former colleague, industry contact, friend',
          required: false
        }
      ]
    },
    {
      id: 'elevator-pitch',
      name: 'Elevator Pitch',
      icon: Zap,
      description: 'Quick, compelling referral for busy professionals',
      platforms: platforms.filter(p => ['twitter', 'whatsapp', 'telegram', 'linkedin'].includes(p.id)),
      autoMessage: (pitch, supporterName) => `🚀 Quick Referral:

${veteranRank || 'Veteran'} ${veteranName} - ${veteranJobType} professional with ${veteranSkills?.slice(0, 2).join(' & ')} expertise.

Why refer? Exceptional leadership, crisis management, and results-driven approach from military service.

Available: ${veteranAvailability}

Pitch: [PITCH_LINK]

Happy to connect you directly.

- ${supporterName}`,
      customFields: [
        {
          label: 'Key Strength',
          type: 'text',
          placeholder: 'e.g., Leadership, Problem-solving, Team management',
          required: false
        }
      ]
    },
    {
      id: 'personal-endorsement',
      name: 'Personal Endorsement',
      icon: Heart,
      description: 'Warm, personal endorsement from your perspective',
      platforms: platforms.filter(p => ['facebook', 'instagram', 'whatsapp', 'email'].includes(p.id)),
      autoMessage: (pitch, supporterName) => `Hi friends and network,

I wanted to share about ${veteranRank || 'Veteran'} ${veteranName}, a military veteran I'm supporting in their civilian career transition.

${veteranName} has incredible skills in ${veteranSkills?.slice(0, 2).join(' and ')} and is looking for ${veteranJobType} opportunities. What stands out to me is their dedication, discipline, and ability to lead teams through challenging situations.

They're available ${veteranAvailability} and I believe they would be an asset to any team.

If you know of opportunities or can help spread the word, please check out their pitch: [PITCH_LINK]

Thanks for your support!
${supporterName}`,
      customFields: [
        {
          label: 'Personal Note',
          type: 'textarea',
          placeholder: 'Add a personal touch about why you\'re supporting this veteran',
          required: false
        }
      ]
    },
    {
      id: 'professional-recommendation',
      name: 'Professional Recommendation',
      icon: Award,
      description: 'Formal professional recommendation for corporate contacts',
      platforms: platforms.filter(p => ['linkedin', 'email'].includes(p.id)),
      autoMessage: (pitch, supporterName) => `Dear [Hiring Manager/Recruiter],

I am writing to highly recommend ${veteranRank || 'Veteran'} ${veteranName} for ${veteranJobType} opportunities within your organization.

${veteranName} possesses exceptional expertise in ${veteranSkills?.slice(0, 3).join(', ')} and brings unique value through their military leadership experience. They have demonstrated ability to manage complex operations, lead diverse teams, and deliver results under pressure.

Key strengths include:
• Strategic planning and execution
• Team leadership and development
• Crisis management and problem-solving
• Results-oriented approach

They are available for ${veteranAvailability} opportunities and I am confident they would be an excellent addition to your team.

Please review their professional pitch: [PITCH_LINK]

I would be happy to provide additional context or arrange a direct introduction.

Best regards,
${supporterName}`,
      customFields: [
        {
          label: 'Hiring Manager/Recruiter',
          type: 'text',
          placeholder: 'Enter contact name and title',
          required: true
        },
        {
          label: 'Company',
          type: 'text',
          placeholder: 'Enter company name',
          required: true
        },
        {
          label: 'Specific Role',
          type: 'text',
          placeholder: 'e.g., Project Manager, Team Lead, Consultant',
          required: false
        }
      ]
    }
  ]

  useEffect(() => {
    if (isOpen) {
      loadSupporterProfile()
      generateShareLink()
    }
  }, [isOpen, supporterId, pitchId])

  useEffect(() => {
    if (selectedTemplate && selectedPlatform) {
      updatePreviewMessage()
    }
  }, [selectedTemplate, selectedPlatform, customFields])

  async function loadSupporterProfile() {
    try {
      const supabase = createSupabaseBrowser()
      const { data: profile } = await supabase
        .from('users')
        .select('name')
        .eq('id', supporterId)
        .single()
      
      if (profile?.name) {
        setSupporterName(profile.name)
      }
    } catch (error) {
      console.error('Error loading supporter profile:', error)
    }
  }

  async function generateShareLink() {
    try {
      // Use the existing referral system
      const result = await createOrGetReferralClient({
        pitch_id: pitchId,
        user_id: supporterId
      })

      if (result.success && result.data) {
        setShareLink(result.data.share_link)
      } else {
        console.error('Error generating share link:', result.error)
        // Fallback to a simple link
        setShareLink(`${window.location.origin}/pitch/${pitchId}`)
      }
    } catch (error) {
      console.error('Error generating share link:', error)
      // Fallback to a simple link
      setShareLink(`${window.location.origin}/pitch/${pitchId}`)
    }
  }

  function updatePreviewMessage() {
    if (!selectedTemplate || !selectedPlatform) return

    const template = shareTemplates.find(t => t.id === selectedTemplate)
    const platform = platforms.find(p => p.id === selectedPlatform)
    
    if (!template || !platform) return

    const pitch = {
      title: pitchTitle,
      skills: veteranSkills,
      job_type: veteranJobType,
      availability: veteranAvailability,
      location: veteranLocation
    }

    let message = template.autoMessage(pitch, supporterName)
    
    // Replace custom fields
    Object.keys(customFields).forEach(field => {
      const placeholder = `[${field}]`
      message = message.replace(new RegExp(placeholder, 'g'), customFields[field] || placeholder)
    })

    // Replace pitch link
    message = message.replace('[PITCH_LINK]', shareLink)
    
    // Truncate if exceeds platform limit
    if (platform.characterLimit && message.length > platform.characterLimit) {
      message = message.substring(0, platform.characterLimit - 3) + '...'
    }

    setPreviewMessage(message)
    setPlatformMessage(message)
  }

  function createShareUrl(platform: string) {
    if (!shareLink) return '#'
    
    const message = platformMessage || previewMessage
    
    switch (platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(message)}`
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`
      case 'email':
        return `mailto:?subject=${encodeURIComponent(`Veteran Referral: ${veteranName}`)}&body=${encodeURIComponent(message)}`
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(message)}`
      case 'telegram':
        return `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(message)}`
      case 'copy':
        return shareLink
      default:
        return shareLink
    }
  }

  async function handleShare(platform: string) {
    if (!shareLink) return

    const shareUrl = createShareUrl(platform)
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    } else if (platform === 'email') {
      window.open(shareUrl, '_blank')
    } else {
      window.open(shareUrl, '_blank')
    }

    // Track share event using the existing referral system
    try {
      // Get the referral ID from the share link
      const referralId = shareLink.split('/').pop()
      if (referralId) {
        await trackReferralShareClient(referralId, platform)
      }
    } catch (error) {
      console.error('Error tracking share event:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share Veteran's Pitch</h2>
            <p className="text-gray-600 mt-1">
              Help {veteranName} by sharing their pitch with your network
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Veteran Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">
                  {veteranRank || 'Veteran'} {veteranName}
                </h3>
                <p className="text-blue-700 text-sm mt-1">{pitchTitle}</p>
                {veteranSkills && veteranSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {veteranSkills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-blue-600 text-sm mt-2">
                  Available for {veteranAvailability} {veteranJobType} opportunities
                </p>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Your Referral Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shareTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <template.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{template.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          {selectedTemplate && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Platform</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {shareTemplates
                  .find(t => t.id === selectedTemplate)
                  ?.platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        selectedPlatform === platform.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 ${platform.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        {(() => {
                          const IconComponent = platform.icon
                          return IconComponent ? <IconComponent className="h-5 w-5 text-white" /> : null
                        })()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                      <p className="text-xs text-gray-500 mt-1">{platform.description}</p>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {selectedTemplate && selectedPlatform && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customize Your Message</h3>
              <div className="space-y-4">
                {shareTemplates
                  .find(t => t.id === selectedTemplate)
                  ?.customFields?.map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={customFields[field.label] || ''}
                          onChange={(e) => setCustomFields(prev => ({ ...prev, [field.label]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={customFields[field.label] || ''}
                          onChange={(e) => setCustomFields(prev => ({ ...prev, [field.label]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Message Preview */}
          {selectedTemplate && selectedPlatform && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Message Preview</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const platform = platforms.find(p => p.id === selectedPlatform)
                    const IconComponent = platform?.icon
                    return (
                      <>
                        <div className={`w-6 h-6 ${platform?.color} rounded-full flex items-center justify-center`}>
                          {IconComponent && <IconComponent className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {platform?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({previewMessage.length} characters)
                        </span>
                      </>
                    )
                  })()}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{previewMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Share Actions */}
          {selectedTemplate && selectedPlatform && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare(selectedPlatform)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Share on {platforms.find(p => p.id === selectedPlatform)?.name}
              </button>
              
              <button
                onClick={() => handleShare('copy')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
