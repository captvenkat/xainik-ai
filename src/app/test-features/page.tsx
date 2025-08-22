'use client'

import { useState } from 'react'
import { Share2, MessageCircle, Linkedin, Twitter, Mail, Copy, Check } from 'lucide-react'
import { generateShareMessage, generateWaitlistMessage, generatePitchShareUrl } from '@/lib/sharing-messages'

export default function TestFeaturesPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('whatsapp')

  // Sample data for testing
  const samplePitch = {
    title: "Experienced Military Leader Seeking Operations Management Role",
    veteranName: "Captain Sarah Johnson",
    skills: ["Leadership", "Project Management", "Strategic Planning"],
    location: "Mumbai, India"
  }

  const sampleWaitlistPosition = 15

  const platforms = [
    { key: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
    { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { key: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { key: 'email', name: 'Email', icon: Mail, color: 'text-purple-500' },
    { key: 'copy', name: 'Copy', icon: Copy, color: 'text-gray-500' }
  ]

  const generatePitchMessage = (platform: string) => {
    return generateShareMessage({
      pitchTitle: samplePitch.title,
      veteranName: samplePitch.veteranName,
      skills: samplePitch.skills,
      location: samplePitch.location,
      platform: platform as 'whatsapp' | 'linkedin' | 'email' | 'twitter' | 'copy',
      context: 'referral'
    })
  }

  const generateWaitlistMsg = (platform: string) => {
    return generateWaitlistMessage(sampleWaitlistPosition, platform as 'whatsapp' | 'linkedin' | 'email' | 'twitter' | 'copy')
  }

  const testShareUrl = "https://xainik.com/pitch/test-123"

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test Features
          </h1>
          <p className="text-xl text-gray-600">
            Testing and demonstration of platform features
          </p>
        </div>

        {/* Pre-built Social Share Messages Test */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Pre-built Social Share Messages
            </h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Test the new pre-built, engaging social share messages for different platforms.
          </p>

          {/* Platform Selector */}
          <div className="flex flex-wrap gap-3 mb-6">
            {platforms.map((platform) => (
              <button
                key={platform.key}
                onClick={() => setSelectedPlatform(platform.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedPlatform === platform.key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <platform.icon className="h-4 w-4" />
                {platform.name}
              </button>
            ))}
          </div>

          {/* Sample Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pitch Sharing */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pitch Sharing Messages
              </h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Sample Pitch:</h4>
                <div className="bg-white rounded-lg p-3 text-sm">
                  <p><strong>Title:</strong> {samplePitch.title}</p>
                  <p><strong>Veteran:</strong> {samplePitch.veteranName}</p>
                  <p><strong>Skills:</strong> {samplePitch.skills.join(', ')}</p>
                  <p><strong>Location:</strong> {samplePitch.location}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Generated Message:</h4>
                <div className="bg-white rounded-lg p-3 text-sm whitespace-pre-wrap border">
                  {generatePitchMessage(selectedPlatform)}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Share URL:</h4>
                <div className="bg-white rounded-lg p-3 text-sm font-mono text-blue-600">
                  {generatePitchShareUrl(selectedPlatform, generatePitchMessage(selectedPlatform), testShareUrl)}
                </div>
              </div>

              <button
                onClick={() => {
                  const url = generatePitchShareUrl(selectedPlatform, generatePitchMessage(selectedPlatform), testShareUrl)
                  if (selectedPlatform === 'copy') {
                    navigator.clipboard.writeText(generatePitchMessage(selectedPlatform) + '\n\n' + testShareUrl)
                  } else {
                    window.open(url, '_blank')
                  }
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test {platforms.find(p => p.key === selectedPlatform)?.name} Share
              </button>
            </div>

            {/* Waitlist Sharing */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Waitlist Sharing Messages
              </h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Sample Position:</h4>
                <div className="bg-white rounded-lg p-3 text-sm">
                  <p><strong>Position:</strong> #{sampleWaitlistPosition}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Generated Message:</h4>
                <div className="bg-white rounded-lg p-3 text-sm whitespace-pre-wrap border">
                  {generateWaitlistMsg(selectedPlatform)}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Share URL:</h4>
                <div className="bg-white rounded-lg p-3 text-sm font-mono text-blue-600">
                  {generatePitchShareUrl(selectedPlatform, generateWaitlistMsg(selectedPlatform), 'https://xainik.com/waitlist?ref=15')}
                </div>
              </div>

              <button
                onClick={() => {
                  const url = generatePitchShareUrl(selectedPlatform, generateWaitlistMsg(selectedPlatform), 'https://xainik.com/waitlist?ref=15')
                  if (selectedPlatform === 'copy') {
                    navigator.clipboard.writeText(generateWaitlistMsg(selectedPlatform) + '\n\nhttps://xainik.com/waitlist?ref=15')
                  } else {
                    window.open(url, '_blank')
                  }
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Test {platforms.find(p => p.key === selectedPlatform)?.name} Waitlist Share
              </button>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              New Features Implemented
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Platform-specific message templates for WhatsApp, LinkedIn, Twitter, Email, and Copy
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Engaging, professional messages that highlight veteran skills and experience
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Context-aware messaging (referral vs general sharing)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Proper URL encoding and platform-specific share URLs
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Enhanced ReferModal with Twitter support and better layout
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Updated SocialShareCard with new message system
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Waitlist sharing with compelling messages and position tracking
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
