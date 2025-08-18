'use client'

import { useState, useEffect } from 'react'
import { X, Share2, Mail, Link, Copy, Check, MessageCircle, Users, Briefcase, Heart, Globe, Smartphone, Send, Sparkles, Target, Zap } from 'lucide-react'

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
  channels: string[]
  autoMessage: (pitch: Pitch, userEmail: string) => string
  customFields?: {
    label: string
    type: 'text' | 'email' | 'textarea'
    placeholder: string
    required: boolean
  }[]
}

export default function SharePitchModal({ isOpen, onClose, userId }: SharePitchModalProps) {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [selectedPitch, setSelectedPitch] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewMessage, setPreviewMessage] = useState('')

  // World-class share templates
  const shareTemplates: ShareTemplate[] = [
    {
      id: 'recruiter',
      name: 'Direct to Recruiter',
      icon: Briefcase,
      description: 'Professional pitch for job opportunities',
      channels: ['email', 'linkedin', 'direct'],
      autoMessage: (pitch, userEmail) => `Hi there,

I'm a military veteran with ${pitch.experience} of experience in ${pitch.skills?.slice(0, 3).join(', ')}. I recently created a professional pitch that showcases my unique background and transferable skills.

I believe my military experience in leadership, problem-solving, and strategic thinking would be valuable to your organization. Would you be interested in reviewing my pitch?

You can view it here: [PITCH_LINK]

Best regards,
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
        }
      ]
    },
    {
      id: 'reference',
      name: 'Request References',
      icon: Users,
      description: 'Ask for professional references and recommendations',
      channels: ['email', 'linkedin', 'whatsapp'],
      autoMessage: (pitch, userEmail) => `Hi [Name],

I hope you're doing well! I'm currently transitioning from military service and have created a professional pitch highlighting my experience in ${pitch.skills?.slice(0, 2).join(' and ')}.

I would greatly appreciate if you could:
1. Review my pitch and provide feedback
2. Consider writing a brief recommendation
3. Share it with your professional network if you think it would be helpful

Here's my pitch: [PITCH_LINK]

Thank you for your support!
${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Contact Name',
          type: 'text',
          placeholder: 'Enter contact name',
          required: true
        },
        {
          label: 'Relationship',
          type: 'text',
          placeholder: 'e.g., Former colleague, mentor, supervisor',
          required: false
        }
      ]
    },
    {
      id: 'network',
      name: 'Network Expansion',
      icon: Globe,
      description: 'Expand your professional network',
      channels: ['linkedin', 'email', 'twitter'],
      autoMessage: (pitch, userEmail) => `Hello!

I'm a military veteran transitioning to civilian career and would love to connect with professionals in ${pitch.skills?.slice(0, 2).join(' and ')}.

I've created a pitch that showcases my military experience and how it translates to civilian success. I'd appreciate any feedback or connections you might have.

Check out my pitch: [PITCH_LINK]

Looking forward to connecting!
${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Industry/Field',
          type: 'text',
          placeholder: 'e.g., Technology, Healthcare, Finance',
          required: false
        }
      ]
    },
    {
      id: 'mentorship',
      name: 'Seek Mentorship',
      icon: Heart,
      description: 'Find mentors and career guidance',
      channels: ['email', 'linkedin'],
      autoMessage: (pitch, userEmail) => `Dear [Mentor Name],

I'm a military veteran with ${pitch.experience} of experience, currently transitioning to civilian career. I've created a professional pitch that outlines my background and goals.

I'm seeking mentorship in ${pitch.skills?.slice(0, 2).join(' and ')} and would be grateful for your guidance. Would you be willing to review my pitch and share your insights?

My pitch: [PITCH_LINK]

Thank you for considering this request.
${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Mentor Name',
          type: 'text',
          placeholder: 'Enter mentor name',
          required: true
        },
        {
          label: 'Specific Area',
          type: 'text',
          placeholder: 'e.g., Career transition, Leadership, Technical skills',
          required: false
        }
      ]
    },
    {
      id: 'collaboration',
      name: 'Collaboration Opportunity',
      icon: Zap,
      description: 'Propose partnerships and collaborations',
      channels: ['email', 'linkedin', 'direct'],
      autoMessage: (pitch, userEmail) => `Hi [Name],

I'm a military veteran with expertise in ${pitch.skills?.slice(0, 3).join(', ')}. I've created a pitch that highlights my background and potential collaboration opportunities.

I believe there could be synergies between our work. Would you be interested in exploring potential collaboration?

My pitch: [PITCH_LINK]

Looking forward to discussing possibilities!
${userEmail.split('@')[0]}`,
      customFields: [
        {
          label: 'Contact Name',
          type: 'text',
          placeholder: 'Enter contact name',
          required: true
        },
        {
          label: 'Collaboration Type',
          type: 'text',
          placeholder: 'e.g., Project, Partnership, Advisory',
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
              <h2 className="text-2xl font-bold text-gray-900">Smart Share</h2>
              <p className="text-sm text-gray-600">AI-powered intelligent sharing with context-aware messages</p>
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
                  What's your goal?
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

              {/* Share Channels */}
              {currentTemplate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Share via</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentTemplate.channels.map((channel) => (
                      <span
                        key={channel}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {channel.charAt(0).toUpperCase() + channel.slice(1)}
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
                  {previewMessage || 'Select a pitch and purpose to see your personalized message...'}
                </div>
              </div>

              {/* Smart Tips */}
              {currentTemplate && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Smart Tips</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Message is personalized based on your pitch content</li>
                    <li>• Tone matches your selected purpose</li>
                    <li>• Includes your key skills and experience</li>
                    <li>• Professional yet approachable language</li>
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
              Generate & Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
