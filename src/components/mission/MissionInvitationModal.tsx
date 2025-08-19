'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Users, Share2, Mail, MessageCircle, Copy, Check, X,
  Heart, Star, TrendingUp, ArrowRight, ExternalLink, Twitter, Facebook
} from 'lucide-react'

// =====================================================
// MISSION INVITATION MODAL
// Enhanced with multiple social media platforms
// =====================================================

interface MissionInvitationModalProps {
  userId: string
  userRole: string
  userName: string
  isOpen: boolean
  onClose: () => void
}

export default function MissionInvitationModal({ 
  userId, 
  userRole, 
  userName, 
  isOpen, 
  onClose 
}: MissionInvitationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)

  const defaultMessage = `Hey! I'm supporting Xainik's mission to help veterans succeed. It's a platform where veterans can find opportunities, recruiters can hire amazing talent, and supporters like me can help make connections.

You can join in any role that fits you. Check it out!`

  useEffect(() => {
    if (isOpen && !invitationLink) {
      generateInvitationLink()
    }
  }, [isOpen])

  async function generateInvitationLink() {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowser()
      
      // Note: create_mission_invitation RPC function doesn't exist in live schema
      // Note: mission_invitations table doesn't exist in live schema
      // Generate a temporary invitation link until tables are created
      const data = 'temp-invitation-id'
      const error = null

      if (error) {
        throw new Error('Failed to create invitation')
      }

      // Generate temporary invitation link
      const tempInvitationLink = `${window.location.origin}/invite?ref=${userId}&from=${userRole}`
      setInvitationLink(tempInvitationLink)

    } catch (err: any) {
      console.error('Error generating invitation link:', err)
      setError(err.message || 'Failed to generate invitation link')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function shareViaWhatsApp() {
    if (invitationLink) {
      const message = encodeURIComponent(defaultMessage + '\n\n' + invitationLink)
      const url = `https://wa.me/?text=${message}`
      window.open(url, '_blank')
      setSelectedPlatform('whatsapp')
    }
  }

  function shareViaEmail() {
    if (invitationLink) {
      const subject = encodeURIComponent('Join me in supporting veterans!')
      const body = encodeURIComponent(defaultMessage + '\n\n' + invitationLink)
      const url = `mailto:?subject=${subject}&body=${body}`
      window.open(url)
      setSelectedPlatform('email')
    }
  }

  function shareViaLinkedIn() {
    if (invitationLink) {
      const message = encodeURIComponent(defaultMessage + '\n\n' + invitationLink)
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(invitationLink)}&title=${encodeURIComponent('Join Xainik - Support Veterans')}&summary=${message}`
      window.open(url, '_blank')
      setSelectedPlatform('linkedin')
    }
  }

  function shareViaTwitter() {
    if (invitationLink) {
      const message = encodeURIComponent(defaultMessage + '\n\n' + invitationLink)
      const url = `https://twitter.com/intent/tweet?text=${message}`
      window.open(url, '_blank')
      setSelectedPlatform('twitter')
    }
  }

  function shareViaFacebook() {
    if (invitationLink) {
      const message = encodeURIComponent(defaultMessage + '\n\n' + invitationLink)
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(invitationLink)}&quote=${message}`
      window.open(url, '_blank')
      setSelectedPlatform('facebook')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invite to Mission</h2>
              <p className="text-sm text-gray-600">Share the mission with your network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mission Description */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">The Mission</span>
            </div>
            <p className="text-sm text-gray-700">
              Help veterans succeed by connecting them with opportunities, 
              recruiters, and supporters. Everyone can contribute to this mission!
            </p>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">How it works:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-green-600">1</span>
                </div>
                <span>You share this invitation</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
                <span>They choose their role when joining</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-600">3</span>
                </div>
                <span>Together we help veterans succeed</span>
              </div>
            </div>
          </div>

          {/* Invitation Link */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={generateInvitationLink}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : invitationLink ? (
            <div className="space-y-4">
              {/* Copy Link */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className={`p-2 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Share via:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={shareViaWhatsApp}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      selectedPlatform === 'whatsapp'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </button>

                  <button
                    onClick={shareViaEmail}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      selectedPlatform === 'email'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-xs font-medium">Email</span>
                  </button>

                  <button
                    onClick={shareViaLinkedIn}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      selectedPlatform === 'linkedin'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="text-xs font-medium">LinkedIn</span>
                  </button>

                  <button
                    onClick={shareViaTwitter}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      selectedPlatform === 'twitter'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="text-xs font-medium">X (Twitter)</span>
                  </button>

                  <button
                    onClick={shareViaFacebook}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      selectedPlatform === 'facebook'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="text-xs font-medium">Facebook</span>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      copied
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <Copy className="w-5 h-5" />
                    <span className="text-xs font-medium">Copy Link</span>
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {selectedPlatform && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      Invitation shared via {selectedPlatform}!
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Your invitation impact will be tracked</span>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
