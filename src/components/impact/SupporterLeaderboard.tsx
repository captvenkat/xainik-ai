'use client'

import { Trophy, Medal, Award, Users, Phone, DollarSign } from 'lucide-react'
import { SupporterData } from '@/lib/actions/impact/supporters'

interface SupporterLeaderboardProps {
  data?: SupporterData[]
}

export default function SupporterLeaderboard({ data }: SupporterLeaderboardProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Supporters</h3>
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No supporter data available</p>
          <p className="text-sm text-gray-400 mt-2">Start sharing your pitch to see supporter impact</p>
        </div>
      </div>
    )
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 text-sm font-medium text-gray-500">{index + 1}</span>
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-50 border-yellow-200'
      case 1:
        return 'bg-gray-50 border-gray-200'
      case 2:
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Supporters</h3>
      
      <div className="space-y-3">
        {data.slice(0, 10).map((supporter, index) => (
          <div 
            key={supporter.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${getRankColor(index)}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(index)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{supporter.name}</p>
                <p className="text-sm text-gray-600">{supporter.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900">{supporter.callsMade}</span>
                </div>
                <p className="text-xs text-gray-600">Calls</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900">${supporter.valueGeneratedUsd.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600">Value</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {data.reduce((sum, s) => sum + s.referralsGenerated, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Referrals</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {data.reduce((sum, s) => sum + s.callsMade, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Calls</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              ${data.reduce((sum, s) => sum + s.valueGeneratedUsd, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  )
}
