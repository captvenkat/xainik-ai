'use client'

import { TrendingUp, TrendingDown, Share, Eye, Phone } from 'lucide-react'
import { micro } from '@/lib/microcopy/progress'
import type { KPI } from '@/lib/actions/progress'

interface KpiRowProps {
  data: {
    shares: KPI
    views: KPI
    contacts: KPI
  } | null
}

export default function KpiRow({ data }: KpiRowProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      key: 'shares',
      title: 'Shares',
      value: data.shares.value,
      delta: data.shares.deltaPct,
      spark: data.shares.spark,
      icon: Share,
      color: 'blue',
      tooltip: micro.kpis.shares
    },
    {
      key: 'views',
      title: 'Views',
      value: data.views.value,
      delta: data.views.deltaPct,
      spark: data.views.spark,
      icon: Eye,
      color: 'green',
      tooltip: micro.kpis.views
    },
    {
      key: 'contacts',
      title: 'Contacts',
      value: data.contacts.value,
      delta: data.contacts.deltaPct,
      spark: data.contacts.spark,
      icon: Phone,
      color: 'purple',
      tooltip: micro.kpis.contacts
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const isPositive = kpi.delta >= 0
        const colorClasses = {
          blue: 'text-blue-600 bg-blue-100',
          green: 'text-green-600 bg-green-100',
          purple: 'text-purple-600 bg-purple-100'
        }

        return (
          <div 
            key={kpi.key}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            title={kpi.tooltip}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${colorClasses[kpi.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(kpi.delta).toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-500">vs previous</div>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
              <p className="text-3xl font-bold text-gray-900">{kpi.value.toLocaleString()}</p>
            </div>

            {/* Sparkline */}
            {kpi.spark.length > 0 && (
              <div className="flex items-end gap-1 h-8">
                {kpi.spark.map((point, index) => {
                  const maxValue = Math.max(...kpi.spark.map(p => p.v))
                  const height = maxValue > 0 ? (point.v / maxValue) * 100 : 0
                  
                  return (
                    <div
                      key={index}
                      className={`flex-1 rounded-sm ${colorClasses[kpi.color as keyof typeof colorClasses].split(' ')[0]}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
