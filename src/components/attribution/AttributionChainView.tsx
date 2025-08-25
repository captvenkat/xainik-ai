'use client'

import { useState, useEffect } from 'react'
import { getAttributionChain } from '@/lib/attribution-analytics'
import { Share2, Users, TrendingUp, Eye, Phone, Mail, Link } from 'lucide-react'

interface AttributionChainViewProps {
  pitchId: string
}

interface AttributionChain {
  referral_id: string
  supporter_id: string | null
  pitch_id: string
  share_link: string
  platform: string
  parent_referral_id: string | null
  original_supporter_id: string | null
  attribution_chain: string[]
  attribution_depth: number
  source_type: string
  created_at: string
  original_supporter_name: string | null
  original_supporter_email: string | null
  current_supporter_name: string | null
  current_supporter_email: string | null
  pitch_title: string
  pitch_owner_name: string | null
  chain_total_views: number
  chain_total_calls: number
  chain_total_emails: number
  chain_total_shares: number
  chain_total_conversions: number
  chain_reach: number
  viral_coefficient: number
}

export default function AttributionChainView({ pitchId }: AttributionChainViewProps) {
  const [attributionChain, setAttributionChain] = useState<AttributionChain[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChain, setSelectedChain] = useState<AttributionChain | null>(null)

  useEffect(() => {
    const fetchAttributionChain = async () => {
      try {
        const chain = await getAttributionChain(pitchId)
        setAttributionChain(chain)
      } catch (error) {
        console.error('Error fetching attribution chain:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttributionChain()
  }, [pitchId])

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'direct':
        return 'bg-gray-100 text-gray-800'
      case 'self':
        return 'bg-blue-100 text-blue-800'
      case 'supporter':
        return 'bg-green-100 text-green-800'
      case 'anonymous':
        return 'bg-yellow-100 text-yellow-800'
      case 'chain':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceTypeLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'direct':
        return 'Direct Visit'
      case 'self':
        return 'Self Share'
      case 'supporter':
        return 'Supporter Share'
      case 'anonymous':
        return 'Anonymous'
      case 'chain':
        return 'Chain Share'
      default:
        return sourceType
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'whatsapp':
        return '📱'
      case 'linkedin':
        return '💼'
      case 'email':
        return '📧'
      case 'web':
        return '🌐'
      case 'direct':
        return '🎯'
      default:
        return '🔗'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (attributionChain.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Attribution Data</h3>
          <p className="text-sm">Start sharing your pitch to see attribution chains here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Attribution Chain</h3>
            <p className="text-sm text-gray-600">
              Complete tracking of how your pitch spreads through referrals
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{attributionChain.length} chains tracked</span>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {attributionChain.map((chain, index) => (
          <div
            key={chain.referral_id}
            className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedChain?.referral_id === chain.referral_id ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedChain(selectedChain?.referral_id === chain.referral_id ? null : chain)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">{getPlatformIcon(chain.platform)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(chain.source_type)}`}>
                      {getSourceTypeLabel(chain.source_type)}
                    </span>
                    {chain.attribution_depth > 0 && (
                      <span className="text-xs text-gray-500">
                        Depth: {chain.attribution_depth}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {chain.original_supporter_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">Original:</span>
                      <span className="text-gray-700">{chain.original_supporter_name}</span>
                      {chain.original_supporter_email && (
                        <span className="text-gray-500">({chain.original_supporter_email})</span>
                      )}
                    </div>
                  )}
                  
                  {chain.current_supporter_name && chain.current_supporter_name !== chain.original_supporter_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">Current:</span>
                      <span className="text-gray-700">{chain.current_supporter_name}</span>
                      {chain.current_supporter_email && (
                        <span className="text-gray-500">({chain.current_supporter_email})</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Created:</span>
                    <span>{new Date(chain.created_at).toLocaleDateString()}</span>
                    <span>at {new Date(chain.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                {selectedChain?.referral_id === chain.referral_id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Chain Performance</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600">
                          <Eye className="h-4 w-4" />
                          <span className="font-semibold">{chain.chain_total_views}</span>
                        </div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <Phone className="h-4 w-4" />
                          <span className="font-semibold">{chain.chain_total_calls}</span>
                        </div>
                        <div className="text-xs text-gray-500">Calls</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-purple-600">
                          <Mail className="h-4 w-4" />
                          <span className="font-semibold">{chain.chain_total_emails}</span>
                        </div>
                        <div className="text-xs text-gray-500">Emails</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-600">
                          <Share2 className="h-4 w-4" />
                          <span className="font-semibold">{chain.chain_total_shares}</span>
                        </div>
                        <div className="text-xs text-gray-500">Shares</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Conversions:</span>
                        <span className="font-semibold text-green-600">{chain.chain_total_conversions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Chain Reach:</span>
                        <span className="font-semibold text-blue-600">{chain.chain_reach}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Viral Coefficient:</span>
                        <span className="font-semibold text-purple-600">{chain.viral_coefficient}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>{chain.chain_total_conversions} conversions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
