'use client'

import { useState } from 'react'
import { Users, Mail, X, Send, Check } from 'lucide-react'

interface InviteSupporterModalProps {
  pitchId: string
  onClose: () => void
}

export default function InviteSupporterModal({ pitchId, onClose }: InviteSupporterModalProps) {
  const [emails, setEmails] = useState<string[]>([''])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleAddEmail = () => {
    setEmails([...emails, ''])
  }

  const handleRemoveEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index))
    }
  }

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const handleSendInvites = async () => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'))
    if (validEmails.length === 0) return

    setSending(true)
    try {
      // Simulate sending invites
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSent(true)
    } catch (error) {
      console.error('Error sending invites:', error)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invites Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your supporter invites have been sent successfully.
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Invite Supporters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-4">
            Invite friends and colleagues to become supporters and help amplify your pitch:
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {emails.length > 1 && (
                <button
                  onClick={() => handleRemoveEmail(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAddEmail}
            className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 transition-colors py-2"
          >
            <Users className="w-4 h-4" />
            Add Another Email
          </button>

          <button
            onClick={handleSendInvites}
            disabled={sending || emails.every(email => !email.trim())}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Invites
              </>
            )}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Supporters can help share your pitch and connect you with opportunities
          </p>
        </div>
      </div>
    </div>
  )
}
