'use client'

import { FunnelData } from '@/lib/actions/impact/funnel'
import ReferralFunnel from '../ReferralFunnel'

interface FunnelCardProps {
  data?: FunnelData
}

export default function FunnelCard({ data }: FunnelCardProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  // Transform data to match ReferralFunnel component interface
  const funnelData = {
    opens: data.opens,
    views: data.views,
    calls: data.calls,
    emails: data.emails
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Impact Funnel</h3>
      
      <ReferralFunnel 
        data={funnelData} 
        title="Referral to Outcome Funnel"
        showChart={true}
      />
      
      {/* Additional outcome metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-3">Outcomes Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{data.jobOffers}</div>
            <div className="text-sm text-gray-600">Job Offers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{data.interviews}</div>
            <div className="text-sm text-gray-600">Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{data.referrals}</div>
            <div className="text-sm text-gray-600">Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">${data.totalValueUsd.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  )
}
