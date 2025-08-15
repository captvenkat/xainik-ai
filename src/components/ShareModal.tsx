'use client'

import { useState } from 'react'
import { X, Share2, Linkedin, Twitter, MessageCircle, Mail, QrCode, Copy, Check } from 'lucide-react'
import SocialShareButtons from './SocialShareButtons'
import QRCodeGenerator from './QRCodeGenerator'
import EmailTemplates from './EmailTemplates'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  pitchId: string
  pitchTitle: string
  pitchText: string
  veteranName: string
}

type ShareTab = 'social' | 'qr' | 'email'

export default function ShareModal({
  isOpen,
  onClose,
  pitchId,
  pitchTitle,
  pitchText,
  veteranName
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('social')
  const [copied, setCopied] = useState(false)

  const pitchUrl = `${window.location.origin}/pitch/${pitchId}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pitchUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'social', name: 'Social Media', icon: Share2 },
    { id: 'qr', name: 'QR Code', icon: QrCode },
    { id: 'email', name: 'Email Templates', icon: Mail }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Share Pitch</h2>
            <p className="text-sm text-gray-600 mt-1">{pitchTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Copy Link */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pitchUrl}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-md bg-white text-sm"
            />
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ShareTab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Share on Social Media</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share {veteranName}'s pitch on your social networks to help them get discovered.
                </p>
              </div>
              <SocialShareButtons
                pitchId={pitchId}
                pitchTitle={pitchTitle}
                pitchText={pitchText}
                veteranName={veteranName}
                className="justify-center"
              />
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">QR Code for In-Person Sharing</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate a QR code that people can scan to view the pitch on their phone. Perfect for networking events!
                </p>
              </div>
              <QRCodeGenerator
                pitchId={pitchId}
                pitchTitle={pitchTitle}
                className="flex justify-center"
              />
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Professional Email Templates</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use these pre-written email templates to introduce {veteranName} to your network professionally.
                </p>
              </div>
              <EmailTemplates
                pitchId={pitchId}
                pitchTitle={pitchTitle}
                pitchText={pitchText}
                veteranName={veteranName}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Help {veteranName} get discovered by sharing their pitch!
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
