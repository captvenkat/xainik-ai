'use client'

import { makeMockPitch } from '@/lib/mockData'
import { Shield, MapPin, Target, Star, Share2, UserPlus, Eye, MousePointer, Phone } from 'lucide-react'

interface VeteranPitchCardProps {
  className?: string
}

export default function VeteranPitchCard({ className = '' }: VeteranPitchCardProps) {
  const mockPitch = makeMockPitch(0) // Use first mock pitch

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-5 max-w-sm ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{mockPitch.name}</h3>
            <p className="text-sm text-gray-600">{mockPitch.service}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium">{mockPitch.endorsements}</span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-5 text-gray-600">
        <MapPin className="w-4 h-4" />
        <span className="text-sm">{mockPitch.city}</span>
      </div>

      {/* Target Role */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Target Role</span>
        </div>
        <div className="space-y-2">
          {mockPitch.targetRoles.map((role, index) => (
            <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
              {role}
            </div>
          ))}
        </div>
      </div>

      {/* Labeled Mini-Metrics */}
      <div className="pt-4 border-t border-gray-100 mb-5">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-lg font-semibold text-blue-600">{mockPitch.stats.opens}</div>
            <div className="text-xs text-gray-600 font-medium">Views</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-lg font-semibold text-green-600">{mockPitch.stats.clicks}</div>
            <div className="text-xs text-gray-600 font-medium">Clicks</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center mt-3">
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-lg font-semibold text-purple-600">{mockPitch.stats.sharesToday}</div>
            <div className="text-xs text-gray-600 font-medium">Referrals</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <div className="text-lg font-semibold text-orange-600">{mockPitch.stats.callsWeek}</div>
            <div className="text-xs text-gray-600 font-medium">Calls</div>
          </div>
        </div>
      </div>

      {/* Primary/Secondary Actions */}
      <div className="flex gap-3 mb-4">
        <button className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" />
          Get Referral Link
        </button>
      </div>

      {/* Status Badge */}
      <div className="text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          Available for Opportunities
        </span>
      </div>
    </div>
  )
}
