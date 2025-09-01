'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ImpactTracker from '@/components/ImpactTracker'
import ProblemCards from '@/components/ProblemCards'
import LedByExperience from '@/components/LedByExperience'
import Solution from '@/components/Solution'
import DonationModal from '@/components/DonationModal'
import Transparency from '@/components/Transparency'
import StayConnected from '@/components/StayConnected'
import SocialShareModal from '@/components/SocialShareModal'
import HeroOverlay from '@/components/xk/HeroOverlay'
import StatsBand from '@/components/xk/StatsBand'
import StoryCard from '@/components/xk/StoryCard'
import FinalCall from '@/components/xk/FinalCall'

export default function Home() {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDonationModal, setShowDonationModal] = useState(false)

  // Listen for custom events to open modals
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

  return (
    <main className="min-h-screen">
      <HeroOverlay />
      <StatsBand />
      <ImpactTracker />
      <ProblemCards />
      <Solution />
      <LedByExperience />
      <StoryCard />
      <Transparency />
      <StayConnected />
      
      {/* Donation Section */}
      <section id="donate" className="app-section bg-premium-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="premium-heading text-3xl md:text-5xl mb-6 text-premium-white">
              Support Our <span className="military-heading">Mission</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Every contribution directly supports veteran career transitions. Join us in building the future our heroes deserve.
            </p>
          </div>
          
          <div className="premium-card max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🎖️</div>
            <h3 className="text-2xl font-bold text-premium-white mb-4">
              Stand With Soldiers
            </h3>
            <p className="text-gray-300 mb-8">
              Your donation funds AI-powered career support, training programs, and direct veteran assistance.
            </p>
            
            <button
              onClick={() => setShowDonationModal(true)}
              className="inline-flex items-center justify-center rounded-2xl px-8 py-4 font-semibold shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 transition"
              style={{
                color: '#0F0F0F',
                backgroundImage: "linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)",
                boxShadow: "0 0 0 2px rgba(212,175,55,0.4), 0 8px 30px rgba(0,0,0,0.6)",
              }}
            >
              Donate Now
            </button>
            
                                <p className="text-sm text-gray-400 mt-4">
                      100% transparent. Every rupee tracked and accounted for.
                    </p>
                    
                    {/* Share Mission Button */}
                    <div className="mt-6">
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="inline-flex items-center gap-3 bg-premium-gray/50 hover:bg-premium-gray/70 text-premium-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border border-military-gold/30"
                      >
                        <span>Share This Mission</span>
                        <span className="transform group-hover:scale-110 transition-transform">📢</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
      
      {/* Final Call to Action */}
      <FinalCall />

      {/* Footer */}
      <footer className="py-12 px-4 bg-premium-gray border-t border-military-gold/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Mission */}
            <div>
              <h3 className="text-military-gold font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Building the world's first AI-powered platform that transforms veteran career transitions from struggle to success.
              </p>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-military-gold font-semibold mb-4">Get in Touch</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Have questions about our mission or want to get involved? Reach out to us.
              </p>
            </div>
            
            {/* Donor Wall */}
            <div>
              <h3 className="text-military-gold font-semibold mb-4">Donor Wall</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                See the heroes who support our veterans and join them in making a difference.
              </p>
              <Link
                href="/donor-wall"
                className="inline-block mt-2 text-military-gold hover:text-yellow-500 text-sm font-medium transition-colors"
              >
                View Donors →
              </Link>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="text-military-gold font-semibold mb-4">Legal Status</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Xainik is an initiative by Veteran Success Foundation (Sec-8 Nonprofit, Regn. No: 138784).
              </p>
            </div>
          </div>
          
          <div className="border-t border-military-gold/20 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Veteran Success Foundation. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Honoring Indian Military Veterans | Building Their Future
            </p>
          </div>
        </div>
      </footer>

      {/* Social Share Modal */}
      {showShareModal && (
        <SocialShareModal 
          isOpen={showShareModal} 
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSuccess={(data) => {
          console.log('Donation successful:', data)
          setShowDonationModal(false)
        }}
      />
    </main>
  )
}
