'use client'

import { useState, useEffect } from 'react'
import { X, Send, FileText, User, MessageCircle, Building, Briefcase } from 'lucide-react'

interface ResumeRequestModalProps {
  isOpen: boolean
  onClose: () => void
  veteranName: string
  pitchId: string
  currentUserId?: string
}

export default function ResumeRequestModal({ 
  isOpen, 
  onClose, 
  veteranName, 
  pitchId,
  currentUserId 
}: ResumeRequestModalProps) {
  const [senderName, setSenderName] = useState('')
  const [senderCompany, setSenderCompany] = useState('')
  const [senderRole, setSenderRole] = useState('')
  const [purpose, setPurpose] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Pre-written message template
  const preWrittenMessage = `Hi ${veteranName},

I came across your profile on Xainik and I'm impressed with your background and experience. I would like to request your resume for a potential opportunity.

${senderName ? `I'm ${senderName}${senderRole ? `, ${senderRole}` : ''}${senderCompany ? ` at ${senderCompany}` : ''}.` : ''}

${purpose ? `Purpose: ${purpose}` : 'Please mention the purpose, for example: job opening of so and so at so and so'}

I believe your military background and skills would be a great fit for this opportunity. Please let me know if you're interested in discussing this further.

Best regards,
${senderName || '[Your Name]'}`

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSenderName('')
      setSenderCompany('')
      setSenderRole('')
      setPurpose('')
      setError('')
      setIsSubmitted(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      setError('You must be logged in to request a resume')
      return
    }

    if (!senderName.trim()) {
      setError('Please enter your name')
      return
    }

    if (!purpose.trim()) {
      setError('Please mention the purpose of your request')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/resume-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pitchId,
          message: preWrittenMessage,
          requesterId: currentUserId,
          senderName: senderName.trim(),
          senderCompany: senderCompany.trim(),
          senderRole: senderRole.trim(),
          purpose: purpose.trim()
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => {
          onClose()
          setIsSubmitted(false)
        }, 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send request')
      }
    } catch (error) {
      console.error('Error sending resume request:', error)
      setError(error instanceof Error ? error.message : 'Failed to send request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Request Resume</h3>
                  <p className="text-sm text-gray-600">Send a professional request to {veteranName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sender Information */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Role
                    </label>
                    <input
                      type="text"
                      value={senderRole}
                      onChange={(e) => setSenderRole(e.target.value)}
                      placeholder="e.g., HR Manager, Recruiter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      value={senderCompany}
                      onChange={(e) => setSenderCompany(e.target.value)}
                      placeholder="Enter your company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Purpose Section */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Request Purpose
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose of Request *
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Mention the purpose, for example: job opening of Project Manager at TechCorp India"
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific about the opportunity you're considering them for
                  </p>
                </div>
              </div>

              {/* Message Preview */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Message Preview
                </h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {preWrittenMessage}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This message will be sent to {veteranName} along with your contact information
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!senderName.trim() || !purpose.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Resume Request
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your resume request has been sent to {veteranName}. They will receive an email notification and can respond directly.
            </p>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <strong>What happens next?</strong><br />
                • {veteranName} will receive an email with your request<br />
                • They can approve or decline the request<br />
                • You'll be notified of their response
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
