'use client'

import { useState, useEffect } from 'react'
import { Users, Star, Trophy, Heart, Award, TrendingUp } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface Supporter {
  id: string
  name: string
  avatar?: string
  impact: number
  contribution: string
  joinedAt: Date
  badges: string[]
}

interface SupportersWallProps {
  pitchId?: string
  className?: string
}

export default function SupportersWall({ 
  pitchId, 
  className = '' 
}: SupportersWallProps) {
  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalImpact, setTotalImpact] = useState(0)

  const supabase = createSupabaseBrowser()

  // Generate mock supporters data
  const generateSupporters = async () => {
    if (!pitchId) return

    setIsLoading(true)
    try {
      // Mock supporters data
      const mockSupporters: Supporter[] = [
        {
          id: '1',
          name: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          impact: 95,
          contribution: 'Shared your pitch with 15+ connections',
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          badges: ['Top Supporter', 'Network Builder']
        },
        {
          id: '2',
          name: 'Amit Patel',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          impact: 87,
          contribution: 'Provided valuable feedback and endorsements',
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          badges: ['Feedback Champion', 'Endorser']
        },
        {
          id: '3',
          name: 'Neha Singh',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          impact: 78,
          contribution: 'Connected you with 3 potential employers',
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          badges: ['Connector', 'Opportunity Creator']
        },
        {
          id: '4',
          name: 'Vikram Malhotra',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          impact: 72,
          contribution: 'Shared on LinkedIn and Twitter',
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
          badges: ['Social Amplifier']
        },
        {
          id: '5',
          name: 'Anjali Gupta',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          impact: 65,
          contribution: 'Provided mentorship and career advice',
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
          badges: ['Mentor', 'Career Guide']
        }
      ]

      setSupporters(mockSupporters)
      setTotalImpact(mockSupporters.reduce((sum, s) => sum + s.impact, 0))
    } catch (error) {
      console.error('Error generating supporters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (pitchId) {
      generateSupporters()
    }
  }, [pitchId])

  const getImpactColor = (impact: number) => {
    if (impact >= 90) return 'text-green-600 bg-green-100'
    if (impact >= 80) return 'text-blue-600 bg-blue-100'
    if (impact >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Top Supporter': return Trophy
      case 'Network Builder': return Users
      case 'Feedback Champion': return Star
      case 'Endorser': return Heart
      case 'Connector': return TrendingUp
      case 'Opportunity Creator': return Award
      case 'Social Amplifier': return TrendingUp
      case 'Mentor': return Star
      case 'Career Guide': return Award
      default: return Star
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Top Supporter': return 'bg-yellow-100 text-yellow-800'
      case 'Network Builder': return 'bg-blue-100 text-blue-800'
      case 'Feedback Champion': return 'bg-green-100 text-green-800'
      case 'Endorser': return 'bg-pink-100 text-pink-800'
      case 'Connector': return 'bg-purple-100 text-purple-800'
      case 'Opportunity Creator': return 'bg-indigo-100 text-indigo-800'
      case 'Social Amplifier': return 'bg-orange-100 text-orange-800'
      case 'Mentor': return 'bg-teal-100 text-teal-800'
      case 'Career Guide': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!pitchId) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Create a pitch to start building your supporters wall</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Supporters Wall</h3>
            <p className="text-sm text-gray-600">Celebrating the people helping you succeed</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{supporters.length}</div>
            <div className="text-xs text-gray-500">Total Supporters</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading your supporters...</p>
          </div>
        ) : supporters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No supporters yet</p>
            <p className="text-sm">Share your pitch to start building your network</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Impact Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Total Impact Score</h4>
                  <p className="text-sm text-gray-600">Combined impact of all supporters</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">{totalImpact}</div>
                  <div className="text-xs text-gray-500">Impact Points</div>
                </div>
              </div>
            </div>

            {/* Supporters List */}
            <div className="space-y-4">
              {supporters.map((supporter) => (
                <div
                  key={supporter.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={supporter.avatar || `https://ui-avatars.com/api/?name=${supporter.name}&background=6366f1&color=fff&size=60`}
                        alt={supporter.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>

                    {/* Supporter Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{supporter.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(supporter.impact)}`}>
                          {supporter.impact} impact
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {supporter.contribution}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {supporter.badges.map((badge) => {
                          const BadgeIcon = getBadgeIcon(badge)
                          return (
                            <span
                              key={badge}
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(badge)}`}
                            >
                              <BadgeIcon className="w-3 h-3" />
                              {badge}
                            </span>
                          )
                        })}
                      </div>

                      <p className="text-xs text-gray-500">
                        Joined {supporter.joinedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {supporters.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Thank you to all your supporters!</span>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500" />
              <span>Building success together</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
