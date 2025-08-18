'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Copy, Check, MessageCircle, Users, Briefcase, Globe, Send, Sparkles, Target, Zap, ExternalLink, MessageSquare, Linkedin, Twitter, Facebook, Instagram, Youtube, Github } from 'lucide-react'

interface SharePitchModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

interface Pitch {
  id: string
  title: string
  content: string
  skills: string[]
  experience: string
  created_at: string
}

interface ShareTemplate {
  id: string
  name: string
  icon: any
  description: string
  platforms: Platform[]
  autoMessage: (pitch: Pitch, userEmail: string) => string
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

export default function SharePitchModal({ isOpen, onClose, userId }: SharePitchModalProps) {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [selectedPitch, setSelectedPitch] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewMessage, setPreviewMessage] = useState('')
  const [platformMessage, setPlatformMessage] = useState('')

  // Platform definitions - Veteran-focused platforms
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
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'bg-gray-800',
      description: 'Developer community',
      characterLimit: 65536,
      features: ['Tech community', 'Portfolio sharing', 'Open source', 'Developer networking']
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'bg-red-600',
      description: 'Video platform',
      characterLimit: 5000,
      features: ['Video content', 'Professional channels', 'Industry content', 'Educational sharing']
    }
  ]

  // World-class copywriting templates - first person, quantifiable value, clarity over cleverness
  const shareTemplates: ShareTemplate[] = [
    {
      id: 'direct-recruiter',
      name: 'Direct to Recruiter',
      icon: Briefcase,
      description: 'Direct approach to recruiters with specific value proposition',
      platforms: platforms.filter(p => ['linkedin', 'email', 'telegram'].includes(p.id)),
      autoMessage: (pitch, userEmail) => `Hi [Recruiter Name],

I'm a military veteran with ${pitch.experience} of experience in ${pitch.skills?.slice(0, 3).join(', ')}. I led teams of 15+ people, managed $2M+ budgets, and delivered projects under pressure.

I can start in 2 weeks. My pitch: [PITCH_LINK]

I want to discuss how I can solve your hiring needs.

${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Recruiter Name',
          type: 'text',
          placeholder: 'Enter recruiter name',
          required: true
        },
        {
          label: 'Company',
          type: 'text',
          placeholder: 'Enter company name',
          required: true
        },
        {
          label: 'Target Role',
          type: 'text',
          placeholder: 'e.g., Project Manager, Team Lead, Consultant',
          required: false
        }
      ]
    },
    {
      id: 'direct-supporter',
      name: 'Direct to Supporter',
      icon: Users,
      description: 'Ask supporters to share your pitch with their network',
      platforms: platforms.filter(p => ['whatsapp', 'telegram', 'email', 'linkedin'].includes(p.id)),
      autoMessage: (pitch, userEmail) => `Hi [Supporter Name],

I'm a military veteran with ${pitch.experience} of experience in ${pitch.skills?.slice(0, 2).join(' and ')}. I'm looking for opportunities.

Can you share this with your network? [PITCH_LINK]

I can start in 2 weeks. I led teams, managed budgets, and delivered results.

${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Supporter Name',
          type: 'text',
          placeholder: 'Enter supporter name',
          required: true
        },
        {
          label: 'Your Relationship',
          type: 'text',
          placeholder: 'e.g., Former colleague, mentor, friend',
          required: false
        }
      ]
    },
    {
      id: 'open-ended',
      name: 'Open Ended',
      icon: Globe,
      description: 'General networking message for broad reach',
      platforms: platforms.filter(p => ['linkedin', 'twitter', 'whatsapp', 'telegram', 'facebook'].includes(p.id)),
      autoMessage: (pitch, userEmail) => `Hi,

I'm a military veteran with ${pitch.experience} of experience in ${pitch.skills?.slice(0, 2).join(' and ')}. I'm looking for opportunities.

My pitch: [PITCH_LINK]

I can start in 2 weeks. I led teams, managed budgets, and delivered projects.

${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Industry Focus',
          type: 'text',
          placeholder: 'e.g., Technology, Healthcare, Finance, Consulting',
          required: false
        }
      ]
    },
    {
      id: 'corporate-message',
      name: 'Message to Corporates',
      icon: Target,
      description: 'Direct approach to corporate hiring managers',
      platforms: platforms.filter(p => ['linkedin', 'email', 'telegram'].includes(p.id)),
      autoMessage: (pitch, userEmail) => `Hi [Hiring Manager],

I'm a military veteran with ${pitch.experience} of experience in ${pitch.skills?.slice(0, 3).join(', ')}. I led teams of 20+ people, managed $5M+ budgets, and delivered results under pressure.

I can start in 2 weeks. My pitch: [PITCH_LINK]

I want to discuss how I can solve your team's challenges.

${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Hiring Manager',
          type: 'text',
          placeholder: 'Enter hiring manager name',
          required: true
        },
        {
          label: 'Company',
          type: 'text',
          placeholder: 'Enter company name',
          required: true
        },
        {
          label: 'Department',
          type: 'text',
          placeholder: 'e.g., Operations, Strategy, Project Management',
          required: false
        }
      ]
    },
    {
      id: 'contract-opportunity',
      name: 'Contract Opportunity',
      icon: Zap,
      description: 'For contract, freelance, or project-based work',
      platforms: platforms.filter(p => ['linkedin', 'email', 'whatsapp', 'telegram', 'facebook'].includes(p.id)),
      autoMessage: (pitch, userEmail) => `Hi [Contact Name],

I'm a military veteran with ${pitch.experience} of experience in ${pitch.skills?.slice(0, 3).join(', ')}. I'm available for contract work.

I led teams, managed budgets, and delivered projects. I can start in 2 weeks.

My pitch: [PITCH_LINK]

Do you have project needs I can help with?

${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Contact Name',
          type: 'text',
          placeholder: 'Enter contact name',
          required: true
        },
        {
          label: 'Project Type',
          type: 'text',
          placeholder: 'e.g., Contract, Freelance, Project, Interim',
          required: false
        }
      ]
    }
  ]

  useEffect(() => {
    if (isOpen && userId) {
      loadPitches()
    }
  }, [isOpen, userId])

  useEffect(() => {
    if (selectedPitch && selectedTemplate) {
      updatePreviewMessage()
    }
  }, [selectedPitch, selectedTemplate, customFields])

  useEffect(() => {
    if (selectedPlatform && previewMessage) {
      updatePlatformMessage(previewMessage)
    }
  }, [selectedPlatform, previewMessage])

  async function loadPitches() {
    try {
      const response = await fetch('/api/share-pitch')
      const data = await response.json()
      
      if (data.success) {
        setPitches(data.pitches)
        if (data.pitches.length > 0) {
          setSelectedPitch(data.pitches[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load pitches:', error)
    }
  }

  function updatePreviewMessage() {
    const pitch = pitches.find(p => p.id === selectedPitch)
    const template = shareTemplates.find(t => t.id === selectedTemplate)
    
    if (pitch && template) {
      const userEmail = 'veteran@example.com' // This would come from user context
      let message = template.autoMessage(pitch, userEmail)
      
      // Replace placeholders with custom field values
      Object.entries(customFields).forEach(([key, value]) => {
        message = message.replace(`[${key}]`, value || '[Not specified]')
      })
      
      // Replace pitch link placeholder
      message = message.replace('[PITCH_LINK]', `${window.location.origin}/pitch/${selectedPitch}`)
      
      setPreviewMessage(message)
      updatePlatformMessage(message)
    }
  }

  function updatePlatformMessage(baseMessage: string) {
    if (!selectedPlatform) return
    
    const platform = platforms.find(p => p.id === selectedPlatform)
    if (!platform) return

    let message = baseMessage

    // Platform-specific formatting
    switch (platform.id) {
      case 'twitter':
        // Shorten for Twitter's character limit
        if (message.length > 280) {
          message = message.substring(0, 277) + '...'
        }
        // Add relevant hashtags
        message += '\n\n#VeteranTransition #MilitaryToCivilian #CareerChange #Networking'
        break
      
      case 'linkedin':
        // Add LinkedIn-specific formatting
        message = message.replace(/\n\n/g, '\n\n---\n\n')
        message += '\n\n#VeteranTransition #MilitaryLeadership #CareerDevelopment #Networking'
        break
      
      case 'whatsapp':
        // Keep it conversational for WhatsApp
        message = message.replace(/Best regards,/g, 'Thanks!')
        message = message.replace(/Looking forward to connecting!/g, 'Hope to connect soon!')
        break
      
      case 'telegram':
        // Add Telegram-friendly formatting
        message = message.replace(/\n\n/g, '\n')
        message = '📋 ' + message
        break
      
      case 'instagram':
        // Instagram-friendly format
        message = message.replace(/\n\n/g, '\n\n✨ ')
        message += '\n\n#VeteranLife #MilitaryTransition #CareerGoals #ProfessionalDevelopment'
        break
      
      case 'github':
        // GitHub-friendly format
        message = '## Veteran Pitch Share\n\n' + message
        message += '\n\n---\n*Shared via Xainik - Supporting Veteran Transitions*'
        break
    }

    setPlatformMessage(message)
  }

  function handlePlatformShare() {
    if (!selectedPlatform || !platformMessage) return

    const platform = platforms.find(p => p.id === selectedPlatform)
    if (!platform) return

    switch (platform.id) {
      case 'linkedin':
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/pitch/${selectedPitch}`)}&title=${encodeURIComponent('Veteran Pitch')}&summary=${encodeURIComponent(platformMessage)}`
        window.open(linkedinUrl, '_blank')
        break
      
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(platformMessage)}&url=${encodeURIComponent(`${window.location.origin}/pitch/${selectedPitch}`)}`
        window.open(twitterUrl, '_blank')
        break
      
      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/pitch/${selectedPitch}`)}&quote=${encodeURIComponent(platformMessage)}`
        window.open(facebookUrl, '_blank')
        break
      
      case 'email':
        const emailUrl = `mailto:?subject=${encodeURIComponent('Veteran Pitch - Professional Background')}&body=${encodeURIComponent(platformMessage)}`
        window.open(emailUrl, '_blank')
        break
      
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(platformMessage)}`
        window.open(whatsappUrl, '_blank')
        break
      
      case 'telegram':
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/pitch/${selectedPitch}`)}&text=${encodeURIComponent(platformMessage)}`
        window.open(telegramUrl, '_blank')
        break
      
      default:
        // For platforms without direct share URLs, copy to clipboard
        navigator.clipboard.writeText(platformMessage)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  async function handleShare() {
    if (!selectedPitch || !selectedTemplate) return

    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/share-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pitchId: selectedPitch,
          shareType: selectedTemplate,
          message: previewMessage,
          customFields,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setCustomFields({})
          setSelectedTemplate('')
        }, 2000)
      } else {
        alert('Failed to share pitch: ' + data.error)
      }
    } catch (error) {
      console.error('Share error:', error)
      alert('Failed to share pitch')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyMessage() {
    navigator.clipboard.writeText(previewMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  const currentPitch = pitches.find(p => p.id === selectedPitch)
  const currentTemplate = shareTemplates.find(t => t.id === selectedTemplate)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Direct Share</h2>
              <p className="text-sm text-gray-600">World-class copywriting: first person, quantifiable value, clarity over cleverness</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* Select Pitch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Your Pitch
                </label>
                <select
                  value={selectedPitch}
                  onChange={(e) => setSelectedPitch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {pitches.map((pitch) => (
                    <option key={pitch.id} value={pitch.id}>
                      {pitch.title || `Pitch ${new Date(pitch.created_at).toLocaleDateString()}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Share Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your message type?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {shareTemplates.map((template) => {
                    const Icon = template.icon
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm opacity-75">{template.description}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Fields */}
              {currentTemplate?.customFields && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Additional Details</h3>
                  {currentTemplate.customFields.map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={customFields[field.label] || ''}
                          onChange={(e) => setCustomFields(prev => ({ ...prev, [field.label]: e.target.value }))}
                          placeholder={field.placeholder}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              )}

                             {/* Platform Selection */}
               {currentTemplate && (
                 <div>
                   <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Platform</h3>
                   <div className="grid grid-cols-2 gap-2">
                     {currentTemplate.platforms.map((platform) => {
                       const Icon = platform.icon
                       return (
                         <button
                           key={platform.id}
                           onClick={() => setSelectedPlatform(platform.id)}
                           className={`p-3 rounded-lg border-2 transition-all text-left ${
                             selectedPlatform === platform.id
                               ? 'border-blue-500 bg-blue-50 text-blue-700'
                               : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                           }`}
                         >
                           <div className="flex items-center gap-2">
                             <div className={`w-6 h-6 ${platform.color} rounded flex items-center justify-center`}>
                               <Icon className="w-3 h-3 text-white" />
                             </div>
                             <div>
                               <div className="text-sm font-medium">{platform.name}</div>
                               <div className="text-xs opacity-75">{platform.description}</div>
                             </div>
                           </div>
                         </button>
                       )
                     })}
                   </div>
                 </div>
               )}

               {/* Platform Features */}
               {selectedPlatform && (
                 <div className="bg-gray-50 rounded-lg p-3">
                   <h4 className="text-sm font-medium text-gray-700 mb-2">Platform Features</h4>
                   <div className="flex flex-wrap gap-1">
                     {platforms.find(p => p.id === selectedPlatform)?.features.map((feature, index) => (
                       <span
                         key={index}
                         className="px-2 py-1 bg-white text-gray-600 rounded text-xs border"
                       >
                         {feature}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Message Preview</h3>
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {selectedPlatform ? platformMessage : previewMessage || 'Select a pitch and purpose to see your personalized message...'}
                </div>
                {selectedPlatform && (
                  <div className="mt-2 text-xs text-gray-500">
                    Character count: {platformMessage.length} / {platforms.find(p => p.id === selectedPlatform)?.characterLimit || '∞'}
                  </div>
                )}
              </div>

              {/* Copywriting Tips */}
              {currentTemplate && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Copywriting Tips</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• First person perspective</li>
                    <li>• Quantifiable achievements (teams, budgets)</li>
                    <li>• No fluff words or exaggerations</li>
                    <li>• Clarity over cleverness</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Message ready! Copy and share via your preferred channel.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {selectedPlatform ? (
              <button
                onClick={handlePlatformShare}
                disabled={!selectedPitch || !selectedTemplate || !selectedPlatform}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Share on {platforms.find(p => p.id === selectedPlatform)?.name}
              </button>
            ) : (
              <button
                onClick={handleShare}
                disabled={loading || !selectedPitch || !selectedTemplate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Generate Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
