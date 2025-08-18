'use client'

import { useState, useEffect } from 'react'
import { X, Share2, Mail, Link, Copy, Check } from 'lucide-react'

interface SharePitchModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

interface Pitch {
  id: string
  title: string
  created_at: string
}

export default function SharePitchModal({ isOpen, onClose, userId }: SharePitchModalProps) {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [selectedPitch, setSelectedPitch] = useState<string>('')
  const [shareType, setShareType] = useState<'email' | 'link'>('email')
  const [targetEmail, setTargetEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      loadPitches()
    }
  }, [isOpen, userId])

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

  async function handleShare() {
    if (!selectedPitch) return

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
          shareType,
          targetEmail: shareType === 'email' ? targetEmail : undefined,
          message: shareType === 'email' ? message : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setTargetEmail('')
          setMessage('')
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

  function handleCopyLink() {
    const pitchUrl = `${window.location.origin}/pitch/${selectedPitch}`
    navigator.clipboard.writeText(pitchUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Share Your Pitch</h2>
              <p className="text-sm text-gray-600">Reach more people with your story</p>
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
        <div className="p-6 space-y-6">
          {/* Select Pitch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Pitch to Share
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

          {/* Share Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to share?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShareType('email')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  shareType === 'email'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Email</span>
              </button>
              <button
                onClick={() => setShareType('link')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  shareType === 'link'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Link className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Link</span>
              </button>
            </div>
          </div>

          {/* Email Form */}
          {shareType === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Link Sharing */}
          {shareType === 'link' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Share this link with anyone:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedPitch ? `${window.location.origin}/pitch/${selectedPitch}` : ''}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  {shareType === 'email' ? 'Pitch shared via email!' : 'Link copied to clipboard!'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {shareType === 'email' ? (
              <button
                onClick={handleShare}
                disabled={loading || !targetEmail || !selectedPitch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Share via Email
              </button>
            ) : (
              <button
                onClick={handleCopyLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
