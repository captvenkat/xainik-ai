'use client'

import { useState } from 'react'
import { Mail, Copy, Check, Edit3, Save } from 'lucide-react'

interface EmailTemplatesProps {
  pitchId: string
  pitchTitle: string
  pitchText: string
  veteranName: string
  className?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: 'networking' | 'job_search' | 'referral' | 'follow_up'
}

export default function EmailTemplates({ 
  pitchId, 
  pitchTitle, 
  pitchText, 
  veteranName, 
  className = '' 
}: EmailTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [customSubject, setCustomSubject] = useState('')
  const [customBody, setCustomBody] = useState('')

  const pitchUrl = `${window.location.origin}/pitch/${pitchId}`

  const defaultTemplates: EmailTemplate[] = [
    {
      id: 'networking',
      name: 'Networking Introduction',
      subject: `Connecting with ${veteranName} - ${pitchTitle}`,
      body: `Hi [Name],

I hope this email finds you well. I wanted to connect you with ${veteranName}, who has an impressive background and is currently looking for opportunities in [industry/role].

${veteranName} has shared their pitch with me, and I think you might find it interesting:

${pitchTitle}

${pitchText.substring(0, 150)}...

You can view their complete pitch here: ${pitchUrl}

I believe there could be a great opportunity for collaboration or connection here. Would you be open to a brief conversation?

Best regards,
[Your Name]`,
      category: 'networking'
    },
    {
      id: 'job_search',
      name: 'Job Opportunity',
      subject: `Job Opportunity for ${veteranName}`,
      body: `Hi [Name],

I hope you're doing well. I'm reaching out because I know you're connected in the [industry] space, and I wanted to share ${veteranName}'s profile with you.

${veteranName} is a talented professional with experience in [key skills], and they're currently exploring new opportunities. Here's their pitch:

${pitchTitle}

${pitchText.substring(0, 150)}...

Full pitch: ${pitchUrl}

If you know of any relevant opportunities or would like to connect with ${veteranName} directly, I'd be happy to facilitate an introduction.

Thanks for your time!

Best regards,
[Your Name]`,
      category: 'job_search'
    },
    {
      id: 'referral',
      name: 'Direct Referral',
      subject: `Referral: ${veteranName} for [Position/Company]`,
      body: `Hi [Name],

I'm writing to refer ${veteranName} for the [position] role at [company]. I've reviewed their background and believe they would be an excellent fit.

Here's their pitch:

${pitchTitle}

${pitchText.substring(0, 150)}...

Complete profile: ${pitchUrl}

${veteranName} has the skills and experience that align perfectly with what you're looking for. I'd be happy to provide more details or arrange an introduction.

Looking forward to hearing from you.

Best regards,
[Your Name]`,
      category: 'referral'
    },
    {
      id: 'follow_up',
      name: 'Follow-up Message',
      subject: `Following up on ${veteranName}'s pitch`,
      body: `Hi [Name],

I hope you had a chance to review ${veteranName}'s pitch that I shared earlier. I wanted to follow up and see if you had any questions or if there might be an opportunity to connect.

For your reference:
${pitchTitle}
${pitchUrl}

${veteranName} is particularly interested in [specific opportunity/company/role] and would love to discuss how they could contribute.

Would you be available for a brief call this week to discuss further?

Thanks for your time.

Best regards,
[Your Name]`,
      category: 'follow_up'
    }
  ]

  const handleTemplateSelect = (templateId: string) => {
    const template = defaultTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setCustomSubject(template.subject)
      setCustomBody(template.body)
      setIsEditing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const openEmailClient = () => {
    const subject = encodeURIComponent(customSubject)
    const body = encodeURIComponent(customBody)
    const emailUrl = `mailto:?subject=${subject}&body=${body}`
    window.open(emailUrl)
  }

  const saveTemplate = () => {
    // Here you could save to user's custom templates
    setIsEditing(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Mail className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Email Templates</h3>
      </div>

      {/* Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {defaultTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            className={`p-3 text-left border rounded-lg transition-colors ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">{template.name}</div>
            <div className="text-xs text-gray-500 capitalize">{template.category.replace('_', ' ')}</div>
          </button>
        ))}
      </div>

      {/* Template Preview and Edit */}
      {selectedTemplate && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Email Template</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              {isEditing && (
                <button
                  onClick={saveTemplate}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 hover:text-green-800"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md text-sm">{customSubject}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body:</label>
              {isEditing ? (
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">{customBody}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={openEmailClient}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Open Email Client
            </button>

            <button
              onClick={() => copyToClipboard(`${customSubject}\n\n${customBody}`)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
