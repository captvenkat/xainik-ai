'use client'

import { useState } from 'react'
import DonationModal from './DonationModal'
import SocialShareModal from './SocialShareModal'
import Icon from '@/components/ui/Icon'

export default function Hero() {
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center app-section hero-gradient hero-pattern">
      {/* Military Badge Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-military-gold/15 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-military-red/15 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-military-green/15 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center px-4">
        {/* Military Badge */}
        <div className="military-badge mx-auto mb-8 animate-pulse-gold">
          ⭐
        </div>

        {/* Main Headline - Urgent & Emotional */}
        <h1 className="premium-heading text-4xl md:text-6xl lg:text-7xl mb-8 leading-tight animate-slide-in">
          <span className="text-premium-white">Over 5,00,000 retired soldiers</span>
          <br />
          <span className="military-heading">are struggling for dignified jobs</span>
        </h1>

        {/* Subline - Direct & Powerful */}
        <p className="text-hero-subtitle animate-slide-in" style={{animationDelay: '0.2s'}}>
          <span className="text-military-gold font-semibold">They secured us.</span> 
          <span className="text-premium-white"> Now we must secure their future.</span>
        </p>

        {/* Movement Creed - Fire & Urgency */}
        <div className="mb-12 animate-slide-in" style={{animationDelay: '0.4s'}}>
          <div className="inline-flex items-center gap-3 bg-premium-gray/50 backdrop-blur-sm px-8 py-4 rounded-3xl border border-military-red/30">
            <span className="text-3xl">🔥</span>
            <span className="text-2xl md:text-3xl font-bold text-military-red">
              "Don't Just Thank a Soldier. Help Hire One."
            </span>
          </div>
        </div>

        {/* Trust Indicators - Premium & Professional */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 animate-slide-in" style={{animationDelay: '0.6s'}}>
          <div className="trust-indicator">
            <div className="trust-indicator-dot"></div>
            <span className="trust-indicator-text">Sec-8 Nonprofit</span>
          </div>
          <div className="trust-indicator">
            <div className="trust-indicator-dot"></div>
            <span className="trust-indicator-text">20+ Years Experience</span>
          </div>
          <div className="trust-indicator">
            <div className="trust-indicator-dot"></div>
            <span className="trust-indicator-text">AI-First Platform</span>
          </div>
        </div>

        {/* CTA Button - Primary Action */}
        <div className="mb-12 animate-slide-in" style={{animationDelay: '0.8s'}}>
          <button 
            onClick={() => setShowDonationModal(true)}
            className="btn-premium group text-xl md:text-2xl py-6 px-12"
          >
            <span className="flex items-center gap-4">
              <span>👉 Stand With Soldiers — Donate Now</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>
        </div>

        {/* Trust Note - Small & Under Button */}
        <div className="max-w-4xl mx-auto animate-slide-in" style={{animationDelay: '1s'}}>
          <p className="text-mission-statement text-center">
            Every rupee you give goes directly to building a world-class, AI-first post-retirement career support system for ex-servicemen.
          </p>
        </div>

        {/* Secondary CTA - Share Mission */}
        <div className="mt-12 animate-slide-in" style={{animationDelay: '1.2s'}}>
          <button 
            onClick={() => setShowShareModal(true)}
            className="btn-secondary group"
          >
            <span className="flex items-center gap-3">
              <span>Share This Mission</span>
              <span className="transform group-hover:scale-110 transition-transform">📢</span>
            </span>
          </button>
        </div>

        {/* Military Honor Badge */}
        <div className="mt-16 animate-slide-in" style={{animationDelay: '1.4s'}}>
          <div className="inline-flex items-center gap-3 bg-premium-gray/40 backdrop-blur-sm px-6 py-3 rounded-2xl border border-military-gold/30">
                            <Icon name="soldier" size="lg" className="text-military-gold" />
            <span className="text-military-honor">Honoring Indian Military Veterans</span>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <DonationModal 
          isOpen={showDonationModal} 
          onClose={() => setShowDonationModal(false)}
          onSuccess={(data) => {
            console.log('Donation successful:', data)
            setShowDonationModal(false)
            // TODO: Show success message and share popup
          }}
        />
      )}

      {/* Social Share Modal */}
      {showShareModal && (
        <SocialShareModal 
          isOpen={showShareModal} 
          onClose={() => setShowShareModal(false)}
        />
      )}
    </section>
  )
}
