'use client'

import { TrendingUp, Users, Eye, Phone, DollarSign, Target, Zap } from 'lucide-react'
import { ImpactKpis } from '@/lib/actions/impact/kpis'

interface KpiRowProps {
  data?: ImpactKpis
}

export default function KpiRow({ data }: KpiRowProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      label: 'Total Referrals',
      value: data.totalReferrals,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Total Opens',
      value: data.totalOpens,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Calls',
      value: data.totalCalls,
      icon: Phone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Total Value',
      value: `$${data.totalValueUsd.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
          </div>
        </div>
      ))}
      
      {/* Additional metrics row */}
      <div className="col-span-2 md:col-span-4 grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-xl font-bold text-gray-900">{data.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 rounded-lg bg-indigo-50">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Value/Outcome</p>
              <p className="text-xl font-bold text-gray-900">${data.avgValuePerOutcome.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
