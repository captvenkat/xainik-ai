'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Info, Crown, Lock, Users, Edit3, Eye, Share2, AlertTriangle } from 'lucide-react'

interface FreeUserStatusProps {
  userPlan?: string
  onUpgradeClick?: () => void
}

export default function FreeUserStatus({ userPlan = 'free', onUpgradeClick }: FreeUserStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const canDoFeatures = [
    {
      icon: Eye,
      title: 'Browse Platform',
      description: 'View all pitches, recruiters, and platform content'
    },
    {
      icon: Edit3,
      title: 'Edit Profile',
      description: 'Update your personal and military service information'
    },
    {
      icon: Users,
      title: 'Invite Supporters',
      description: 'Send referral links to friends and colleagues'
    },
    {
      icon: Share2,
      title: 'Create Pitches',
      description: 'Draft and save your job pitch content'
    }
  ]

  const cannotDoFeatures = [
    {
      icon: Lock,
      title: 'Publish Pitches',
      description: 'Your pitches remain unpublished and invisible to recruiters'
    },
    {
      icon: Crown,
      title: 'Premium Features',
      description: 'No access to analytics, priority support, or featured placement'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Free Account Status
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              You're currently on a free plan. Here's what you can and cannot do.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          {isExpanded ? 'Show Less' : 'Show Details'}
        </button>
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-900">What You Can Do</h3>
          </div>
          <p className="text-sm text-gray-600">
            Full platform access with profile editing and supporter invites
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-medium text-gray-900">What You Cannot Do</h3>
          </div>
          <p className="text-sm text-gray-600">
            Publish pitches or access premium features
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Can Do Section */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Your Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canDoFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-green-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cannot Do Section */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Current Limitations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cannotDoFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-red-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <feature.icon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="mt-6 pt-6 border-t border-blue-200">
        <div className="bg-white rounded-lg p-4 border border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to Get Noticed?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Upgrade to publish your pitch and connect with recruiters
              </p>
            </div>
            <button
              onClick={onUpgradeClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
