'use client'

import { useState } from 'react'
import { Lightbulb, X, ArrowRight, Share2, Users, Edit3 } from 'lucide-react'
import { NudgeData } from '@/lib/actions/impact/nudges'
import { markNudgeActioned } from '@/lib/actions/impact/nudges'

interface NudgePanelProps {
  data?: NudgeData[]
  pitchId?: string
  pitchTitle?: string
  veteranName?: string
  userId?: string
}

export default function NudgePanel({ data, pitchId, pitchTitle, veteranName, userId }: NudgePanelProps) {
  const [actioning, setActioning] = useState<string | null>(null)
  const [nudges, setNudges] = useState<NudgeData[]>(data || [])

  const handleActionNudge = async (nudgeId: string, type: string) => {
    setActioning(nudgeId)
    try {
      const success = await markNudgeActioned(nudgeId)
      if (success) {
        setNudges(prev => 
          prev.map(n => 
            n.id === nudgeId 
              ? { ...n, actioned: true, actionedAt: new Date().toISOString() }
              : n
          )
        )
      }
    } catch (error) {
      console.error('Error actioning nudge:', error)
    } finally {
      setActioning(null)
    }
  }

  const getNudgeIcon = (type: string) => {
    switch (type) {
      case 'share_pitch':
        return <Share2 className="w-4 h-4" />
      case 'invite_supporter':
        return <Users className="w-4 h-4" />
      case 'update_headline':
        return <Edit3 className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getNudgeColor = (type: string) => {
    switch (type) {
      case 'share_pitch':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'invite_supporter':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'update_headline':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Smart Suggestions</h3>
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No suggestions available</p>
          <p className="text-sm text-gray-400 mt-2">Suggestions will appear as you use the platform</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Smart Suggestions</h3>
      
      <div className="space-y-3">
        {nudges.filter(n => !n.actioned).map((nudge) => (
          <div
            key={nudge.id}
            className={`p-4 rounded-lg border ${getNudgeColor(nudge.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getNudgeIcon(nudge.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">{nudge.title}</h4>
                <p className="text-sm opacity-90 mb-3">{nudge.description}</p>
                
                <button
                  onClick={() => handleActionNudge(nudge.id, nudge.type)}
                  disabled={actioning === nudge.id}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    actioning === nudge.id
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:opacity-80'
                  }`}
                >
                  {actioning === nudge.id ? (
                    <>
                      <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Take Action
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => handleActionNudge(nudge.id, 'dismiss')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {nudges.filter(n => !n.actioned).length} active suggestions
          </p>
          <p className="text-xs text-gray-400">
            Based on your pitch performance
          </p>
        </div>
      </div>
    </div>
  )
}
