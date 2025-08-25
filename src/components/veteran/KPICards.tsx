'use client'

import { TrendingUp, TrendingDown, Share2, Eye, MessageCircle, Award } from 'lucide-react'

interface KPIData {
  shares: {
    value: number
    change: string
    trend: 'up' | 'down'
  }
  views: {
    value: number
    change: string
    trend: 'up' | 'down'
  }
  contacts: {
    value: number
    change: string
    trend: 'up' | 'down'
  }
  hires: {
    value: number
    change: string
    trend: 'up' | 'down'
  }
}

interface KPICardsProps {
  data: KPIData
}

export default function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      key: 'shares',
      label: 'Shares',
      value: data.shares.value,
      change: data.shares.change,
      trend: data.shares.trend,
      icon: Share2,
      color: 'blue',
      description: 'Total pitch shares'
    },
    {
      key: 'views',
      label: 'Views',
      value: data.views.value,
      change: data.views.change,
      trend: data.views.trend,
      icon: Eye,
      color: 'green',
      description: 'Pitch views generated'
    },
    {
      key: 'contacts',
      label: 'Contacts',
      value: data.contacts.value,
      change: data.contacts.change,
      trend: data.contacts.trend,
      icon: MessageCircle,
      color: 'purple',
      description: 'Direct contacts made'
    },
    {
      key: 'hires',
      label: 'Hires',
      value: data.hires.value,
      change: data.hires.change,
      trend: data.hires.trend,
      icon: Award,
      color: 'orange',
      description: 'Successful placements'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          iconBg: 'bg-blue-100',
          change: 'text-blue-600'
        }
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-600',
          iconBg: 'bg-green-100',
          change: 'text-green-600'
        }
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-600',
          iconBg: 'bg-purple-100',
          change: 'text-purple-600'
        }
      case 'orange':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-600',
          iconBg: 'bg-orange-100',
          change: 'text-orange-600'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-600',
          iconBg: 'bg-gray-100',
          change: 'text-gray-600'
        }
    }
  }

  const generateSparklineData = (value: number, trend: 'up' | 'down') => {
    // Generate mock sparkline data based on value and trend
    const points = 7
    const data = []
    const baseValue = Math.max(value / 10, 1)
    
    for (let i = 0; i < points; i++) {
      if (trend === 'up') {
        data.push(Math.floor(baseValue * (0.5 + (i / points) * 1.5) + Math.random() * baseValue * 0.3))
      } else {
        data.push(Math.floor(baseValue * (1.5 - (i / points) * 1) + Math.random() * baseValue * 0.3))
      }
    }
    
    return data
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => {
        const colors = getColorClasses(kpi.color)
        const Icon = kpi.icon
        const sparklineData = generateSparklineData(kpi.value, kpi.trend)
        
        return (
          <div
            key={kpi.key}
            className={`${colors.bg} ${colors.border} rounded-xl border p-6 hover:shadow-md transition-all duration-200`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`${colors.iconBg} w-10 h-10 rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${colors.change}`}>
                  {kpi.change}
                </div>
                <div className="text-xs text-gray-500">
                  {kpi.trend === 'up' ? 'vs last week' : 'vs last week'}
                </div>
              </div>
            </div>

            {/* Main Value */}
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">
                {kpi.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{kpi.label}</div>
            </div>

            {/* Description */}
            <div className="text-xs text-gray-500 mb-4">{kpi.description}</div>

            {/* Sparkline */}
            <div className="h-12 flex items-end justify-between">
              {sparklineData.map((point, index) => {
                const height = Math.max((point / Math.max(...sparklineData)) * 100, 10)
                return (
                  <div
                    key={index}
                    className={`w-1 ${colors.text} rounded-full transition-all duration-300`}
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center gap-1 mt-2">
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className="text-xs text-gray-500">
                {kpi.trend === 'up' ? 'Trending up' : 'Trending down'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
