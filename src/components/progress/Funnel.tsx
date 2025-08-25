'use client'

import { micro } from '@/lib/microcopy/progress'
import type { FunnelPoint } from '@/lib/actions/progress'

interface FunnelProps {
  data: FunnelPoint[] | null
}

export default function Funnel({ data }: FunnelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Funnel</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No funnel data available for this period.</p>
          <p className="text-sm">Share your pitch to see the funnel in action.</p>
        </div>
      </div>
    )
  }

  const stages = [
    { key: 'shares', label: 'Shares', color: 'bg-blue-500' },
    { key: 'views', label: 'Views', color: 'bg-green-500' },
    { key: 'contacts', label: 'Contacts', color: 'bg-purple-500' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Funnel</h3>
      <p className="text-sm text-gray-600 mb-6">See how your pitch moves from shares to views to contacts.</p>

      <div className="space-y-6">
        {stages.map((stage, index) => {
          const funnelData = data.find(d => d.stage === stage.key as any)
          if (!funnelData) return null

          const previousValue = index > 0 ? data[index - 1]?.value || 0 : 0
          const dropoffPct = previousValue > 0 ? ((previousValue - funnelData.value) / previousValue) * 100 : 0

          return (
            <div key={stage.key} className="space-y-3">
              {/* Stage Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 ${stage.color} rounded-full`}></div>
                  <h4 className="font-medium text-gray-900">{stage.label}</h4>
                  <span className="text-sm text-gray-500" title={micro.funnel[`${stage.key}Tip` as keyof typeof micro.funnel]}>
                    ⓘ
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{funnelData.value.toLocaleString()}</div>
                  {index > 0 && (
                    <div className="text-sm text-gray-500">
                      {dropoffPct.toFixed(1)}% drop from {stages[index - 1]?.label?.toLowerCase() || 'previous'}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                  style={{ 
                    width: `${Math.min((funnelData.value / Math.max(...data.map(d => d.value))) * 100, 100)}%` 
                  }}
                ></div>
              </div>

              {/* Source Attribution Strip */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500">{micro.funnel.sourceCaption}</p>
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-400"
                    style={{ width: `${funnelData.sourceSplit.selfPct}%` }}
                    title={`Self: ${funnelData.sourceSplit.selfPct.toFixed(1)}%`}
                  ></div>
                  <div
                    className="bg-green-400"
                    style={{ width: `${funnelData.sourceSplit.supporterPct}%` }}
                    title={`Supporters: ${funnelData.sourceSplit.supporterPct.toFixed(1)}%`}
                  ></div>
                  <div
                    className="bg-gray-400"
                    style={{ width: `${funnelData.sourceSplit.anonPct}%` }}
                    title={`Anonymous: ${funnelData.sourceSplit.anonPct.toFixed(1)}%`}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Self: {funnelData.sourceSplit.selfPct.toFixed(1)}%</span>
                  <span>Supporters: {funnelData.sourceSplit.supporterPct.toFixed(1)}%</span>
                  <span>Anonymous: {funnelData.sourceSplit.anonPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
