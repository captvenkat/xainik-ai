'use client'

import { useState } from 'react'
import { 
  Users, 
  TrendingUp, 
  Share2, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText,
  Award,
  Star,
  Heart,
  Zap
} from 'lucide-react'

interface Supporter {
  id: string
  name: string
  email: string
  shares: number
  views: number
  contacts: number
  hires: number
  avatar_url?: string
}

interface RightRailProps {
  supporters: Supporter[]
  onAction: (action: string, data?: any) => void
}

export default function RightRail({ supporters, onAction }: RightRailProps) {
  const [activeTab, setActiveTab] = useState<'supporters' | 'nudge'>('supporters')

  // Calculate supporter impact scores
  const supportersWithScores = supporters.map(supporter => ({
    ...supporter,
    impactScore: (supporter.views * 2) + (supporter.contacts * 5) + (supporter.hires * 20)
  })).sort((a, b) => b.impactScore - a.impactScore)

  // Generate actionable nudge
  const generateNudge = () => {
    const topSupporter = supportersWithScores[0]
    const totalViews = supporters.reduce((sum, s) => sum + s.views, 0)
    const totalContacts = supporters.reduce((sum, s) => sum + s.contacts, 0)
    const totalHires = supporters.reduce((sum, s) => sum + s.hires, 0)

    if (totalViews === 0) {
      return {
        title: "Start Sharing Your Pitch",
        description: "Your pitch is ready but no one has seen it yet. Start sharing to get discovered.",
        action: "Share Now",
        actionType: "share",
        priority: "high",
        icon: Share2
      }
    }

    if (totalViews > 0 && totalContacts === 0) {
      return {
        title: "Optimize Contact Information",
        description: "People are viewing but not contacting. Make sure your phone and email are prominent.",
        action: "Update Contact",
        actionType: "update_contact",
        priority: "high",
        icon: Phone
      }
    }

    if (totalContacts > 0 && totalHires === 0) {
      return {
        title: "Follow Up with Contacts",
        description: "You have active contacts. Follow up to convert them into opportunities.",
        action: "Follow Up",
        actionType: "follow_up",
        priority: "medium",
        icon: MessageCircle
      }
    }

    if (topSupporter && topSupporter.impactScore > 50) {
      return {
        title: "Thank Your Top Supporter",
        description: `${topSupporter.name} has been incredibly helpful. Show your appreciation.`,
        action: "Send Thanks",
        actionType: "thank_supporter",
        priority: "medium",
        actionData: topSupporter,
        icon: Heart
      }
    }

    return {
      title: "Keep the Momentum Going",
      description: "Your pitch is performing well. Continue sharing and engaging with your network.",
      action: "Share Again",
      actionType: "share_again",
      priority: "low",
      icon: TrendingUp
    }
  }

  const nudge = generateNudge()

  return (
    <div className="w-80 space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('supporters')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'supporters'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Supporters
        </button>
        <button
          onClick={() => setActiveTab('nudge')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'nudge'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Action
        </button>
      </div>

      {/* Content */}
      {activeTab === 'supporters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Top Supporters</h3>
            <span className="text-sm text-gray-500">{supporters.length} total</span>
          </div>

          {supportersWithScores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No supporters yet</p>
              <p className="text-xs">Start sharing to see who helps you</p>
            </div>
          ) : (
            <div className="space-y-3">
              {supportersWithScores.slice(0, 5).map((supporter, index) => (
                <div key={supporter.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>

                    {/* Supporter Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">{supporter.name}</h4>
                        {index < 3 && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{supporter.email}</div>
                    </div>

                    {/* Impact Score */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{supporter.impactScore}</div>
                      <div className="text-xs text-gray-500">impact</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-blue-600">{supporter.shares}</div>
                      <div className="text-xs text-gray-500">shares</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600">{supporter.views}</div>
                      <div className="text-xs text-gray-500">views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-purple-600">{supporter.contacts}</div>
                      <div className="text-xs text-gray-500">contacts</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onAction('message_supporter', supporter)}
                      className="flex-1 py-1.5 px-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3 inline mr-1" />
                      Message
                    </button>
                    <button
                      onClick={() => onAction('thank_supporter', supporter)}
                      className="flex-1 py-1.5 px-2 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                    >
                      <Heart className="w-3 h-3 inline mr-1" />
                      Thank
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'nudge' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Smart Nudge</h3>
            <div className={`w-2 h-2 rounded-full ${
              nudge.priority === 'high' ? 'bg-red-500' :
              nudge.priority === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`} />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <nudge.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{nudge.title}</h4>
                <p className="text-sm text-gray-600">{nudge.description}</p>
              </div>
            </div>

            <button
              onClick={() => onAction(nudge.actionType, nudge.actionData)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                nudge.priority === 'high'
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
                  : nudge.priority === 'medium'
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {nudge.action}
            </button>

            <div className="mt-3 text-xs text-gray-500 text-center">
              {nudge.priority === 'high' && 'High priority action'}
              {nudge.priority === 'medium' && 'Recommended action'}
              {nudge.priority === 'low' && 'Optional action'}
            </div>
          </div>

          {/* Additional Tips */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Quick Tips</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Share your pitch at least once daily</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Engage with supporters who help you</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Update your pitch based on feedback</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
