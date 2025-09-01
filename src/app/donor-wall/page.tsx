'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import DonationModal from '@/components/DonationModal'
import SocialShareModal from '@/components/SocialShareModal'

interface Donation {
  id: string
  amount: number
  displayName: string
  badge: string | null
  date: string
  isAnonymous: boolean
}

interface BadgeSummary {
  tier: string
  minAmount: number
  donorCount: number
  totalAmount: number
}

interface Stats {
  totalRaised: number
  totalDonors: number
  highestSingle: number
  todayRaised: number
}

interface DonorWallData {
  donations: Donation[]
  badgeSummary: BadgeSummary[]
  stats: Stats
}

export default function DonorWall() {
  const [data, setData] = useState<DonorWallData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    fetchDonorWallData()
  }, [])

  // Listen for custom events from navbar
  useEffect(() => {
    const handleOpenDonationModal = () => {
      setShowDonationModal(true)
    }

    const handleOpenShareModal = () => {
      setShowShareModal(true)
    }

    window.addEventListener('openDonationModal', handleOpenDonationModal)
    window.addEventListener('openShareModal', handleOpenShareModal)
    
    return () => {
      window.removeEventListener('openDonationModal', handleOpenDonationModal)
      window.removeEventListener('openShareModal', handleOpenShareModal)
    }
  }, [])

  const fetchDonorWallData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/donor-wall')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch donor wall data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Founding Supporter':
        return 'bg-gradient-to-r from-military-gold to-yellow-500 text-black'
      case 'Champion':
        return 'bg-gradient-to-r from-military-green to-green-500 text-white'
      case 'Friend':
        return 'bg-gradient-to-r from-military-blue to-blue-500 text-white'
      default:
        return 'bg-premium-gray text-premium-white'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-military-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-premium-white text-lg">Loading Donor Wall...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-premium-white mb-4">Error Loading Donor Wall</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchDonorWallData}
            className="bg-military-gold hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-premium-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="premium-heading text-4xl md:text-6xl mb-6 text-premium-white">
            <Icon name="soldier" size="xl" className="inline-block text-military-gold mr-4" />
            <span className="military-heading">Donor Wall</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Honoring the heroes who stand with our veterans. Every contribution builds a stronger future.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Back to Home */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-premium-gray/50 hover:bg-premium-gray/70 text-premium-white px-6 py-3 rounded-xl transition-all duration-300 border border-military-gold/30"
            >
              ← Back to Home
            </Link>
            
            {/* Share Mission Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-3 bg-military-gold hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <span>Share This Mission</span>
              <span className="transform group-hover:scale-110 transition-transform">📢</span>
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="military-card text-center">
              <div className="text-3xl mb-2">
                <Icon name="money" size="lg" className="text-military-gold mx-auto" />
              </div>
              <div className="text-2xl font-bold text-military-gold mb-1">
                {formatAmount(data.stats.totalRaised)}
              </div>
              <div className="text-gray-400">Total Raised</div>
            </div>
            
            <div className="military-card text-center">
              <div className="text-3xl mb-2">
                <Icon name="people" size="lg" className="text-military-gold mx-auto" />
              </div>
              <div className="text-2xl font-bold text-military-gold mb-1">
                {data.stats.totalDonors}
              </div>
              <div className="text-gray-400">Total Donors</div>
            </div>
            
            <div className="military-card text-center">
              <div className="text-3xl mb-2">
                <Icon name="trophy" size="lg" className="text-military-gold mx-auto" />
              </div>
              <div className="text-2xl font-bold text-military-gold mb-1">
                {formatAmount(data.stats.highestSingle)}
              </div>
              <div className="text-gray-400">Highest Single</div>
            </div>
            
            <div className="military-card text-center">
              <div className="text-3xl mb-2">
                <Icon name="calendar" size="lg" className="text-military-gold mx-auto" />
              </div>
              <div className="text-2xl font-bold text-military-gold mb-1">
                {formatAmount(data.stats.todayRaised)}
              </div>
              <div className="text-gray-400">Today's Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Badge Summary Section */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-premium-white text-center mb-12">
            Recognition Tiers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.badgeSummary.map((badge) => (
              <div key={badge.tier} className="military-card text-center">
                <div className="text-4xl mb-4">
                  {badge.tier === 'Founding Supporter' ? (
                    <Icon name="medal" size="xl" className="text-military-gold mx-auto" />
                  ) : badge.tier === 'Champion' ? (
                    <Icon name="trophy" size="xl" className="text-military-gold mx-auto" />
                  ) : (
                    <Icon name="handshake" size="xl" className="text-military-gold mx-auto" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-military-gold mb-2">
                  {badge.tier}
                </h3>
                <div className="text-sm text-gray-400 mb-3">
                  Min: {formatAmount(badge.minAmount)}
                </div>
                <div className="space-y-2">
                  <div className="text-premium-white">
                    <span className="font-semibold">{badge.donorCount}</span> donors
                  </div>
                  <div className="text-military-gold font-bold">
                    {formatAmount(badge.totalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Donations Section */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-premium-white text-center mb-12">
            Recent Supporters
          </h2>
          
          {data.donations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                <Icon name="target" size="xl" className="text-military-gold mx-auto" />
              </div>
              <p className="text-gray-400 text-lg">Be the first to support our veterans!</p>
              <button
                onClick={() => setShowDonationModal(true)}
                className="inline-block mt-6 bg-military-gold hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300"
              >
                Donate Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.donations.map((donation) => (
                <div key={donation.id} className="military-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {donation.isAnonymous ? (
                          <Icon name="spy" size="lg" className="text-military-gold" />
                        ) : (
                          <Icon name="soldier" size="lg" className="text-military-gold" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-premium-white text-lg">
                          {donation.displayName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatDate(donation.date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-military-gold">
                        {formatAmount(donation.amount)}
                      </div>
                      {donation.badge && (
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getBadgeColor(donation.badge)}`}>
                          {donation.badge}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="military-card max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-premium-white mb-4">
                Join the Mission
              </h3>
              <p className="text-gray-300 mb-6">
                Every contribution makes a difference in a veteran's life. Stand with our soldiers today.
              </p>
              <button
                onClick={() => setShowDonationModal(true)}
                className="inline-block bg-military-gold hover:bg-yellow-500 text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSuccess={(data) => {
          console.log('Donation successful:', data)
          setShowDonationModal(false)
          // Refresh donor wall data after successful donation
          fetchDonorWallData()
        }}
      />

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  )
}
