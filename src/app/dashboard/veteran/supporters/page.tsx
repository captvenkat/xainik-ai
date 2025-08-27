'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { useAuth } from '@/lib/hooks/useAuth'
import AppContainer from '@/components/AppContainer'
import BottomNav from '@/components/BottomNav'
import { Users, Heart, Share, MessageCircle } from 'lucide-react'

export default function VeteranSupportersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [supporters, setSupporters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadSupporters()
    }
  }, [user])

  const loadSupporters = async () => {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get user's pitch
      const { data: pitches } = await supabase
        .from('pitches')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1)

      if (pitches && pitches.length > 0) {
        // For now, we'll show mock data
        // In a real implementation, you'd query supporters/referrals tables
        setSupporters([
          {
            id: '1',
            name: 'Colonel Rajesh Kumar',
            role: 'Retired Army Officer',
            avatar: '🦅',
            support_type: 'endorsement',
            message: 'Exceptional leadership skills and strategic thinking',
            date: '2024-01-15'
          },
          {
            id: '2',
            name: 'Major Priya Singh',
            role: 'Defense Consultant',
            avatar: '🛡️',
            support_type: 'referral',
            message: 'Highly recommend for operations management roles',
            date: '2024-01-10'
          },
          {
            id: '3',
            name: 'Captain Amit Patel',
            role: 'Security Specialist',
            avatar: '⚔️',
            support_type: 'endorsement',
            message: 'Proven track record in high-pressure environments',
            date: '2024-01-08'
          }
        ])
      }
    } catch (error) {
      console.error('Error loading supporters:', error)
      setError('Failed to load supporters')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AppContainer>
        <div className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your supporters...</p>
          </div>
        </div>
        <BottomNav />
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <div className="py-8 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Supporters</h1>
          <p className="text-gray-600">People who believe in your military-to-civilian transition</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{supporters.length}</div>
            <div className="text-sm text-gray-600">Total Supporters</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">
              {supporters.filter(s => s.support_type === 'endorsement').length}
            </div>
            <div className="text-sm text-gray-600">Endorsements</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {supporters.filter(s => s.support_type === 'referral').length}
            </div>
            <div className="text-sm text-gray-600">Referrals</div>
          </div>
        </div>

        {/* Supporters List */}
        {supporters.length > 0 ? (
          <div className="space-y-4">
            {supporters.map((supporter) => (
              <div key={supporter.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                    {supporter.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{supporter.name}</h3>
                        <p className="text-sm text-gray-600">{supporter.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {supporter.support_type === 'endorsement' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Heart className="w-3 h-3 mr-1" />
                            Endorsement
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Share className="w-3 h-3 mr-1" />
                            Referral
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{supporter.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(supporter.date).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Message
                        </button>
                        <button className="text-green-600 hover:text-green-700 flex items-center gap-1">
                          <Share className="w-3 h-3" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🤝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No supporters yet</h3>
            <p className="text-gray-600 mb-6">
              Share your pitch to start building your network of supporters
            </p>
            <button
              onClick={() => router.push('/dashboard/veteran?tab=analytics')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share My Pitch
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </AppContainer>
  )
}
