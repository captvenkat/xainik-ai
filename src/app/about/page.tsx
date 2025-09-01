'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import DonationModal from '@/components/DonationModal'
import SocialShareModal from '@/components/SocialShareModal'

export default function About() {
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

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

  return (
    <div className="min-h-screen bg-premium-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-premium-white mb-6">
            About <span className="text-military-gold">Xainik</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Building the world's first AI-powered platform that transforms veteran career transitions from struggle to success.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-premium-gray/50 hover:bg-premium-gray/70 text-premium-white px-6 py-3 rounded-xl transition-all duration-300 border border-military-gold/30"
            >
              ← Back to Home
            </Link>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-3 bg-military-gold hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <span>Share This Mission</span>
              <Icon name="share" size="sm" className="text-black" />
            </button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-premium-white mb-6">
                Our Mission
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Over 5,00,000 retired soldiers struggle for dignified jobs each year. They secured our nation. Now we must secure their future.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Xainik is the world's first AI-powered platform built specifically for veteran career transitions, combining 20+ years of real military-to-civilian transition expertise with cutting-edge artificial intelligence.
              </p>
              <div className="flex items-center gap-4">
                <Icon name="target" size="lg" className="text-military-gold" />
                <span className="text-military-gold font-semibold">Help 5,00,000+ veterans find dignified work</span>
              </div>
            </div>
            
            <div className="military-card p-8">
              <h3 className="text-2xl font-bold text-premium-white mb-6">Key Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-premium-gray/30 rounded-xl">
                  <span className="text-gray-300">Veterans Retiring Annually</span>
                  <span className="text-military-gold font-semibold">5,00,000+</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-premium-gray/30 rounded-xl">
                  <span className="text-gray-300">Successfully Placed</span>
                  <span className="text-military-gold font-semibold">&lt; 20%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-premium-gray/30 rounded-xl">
                  <span className="text-gray-300">Our Target Success Rate</span>
                  <span className="text-military-green font-semibold">85%+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-16 bg-premium-gray/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-premium-white text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="military-card text-center">
              <div className="text-4xl mb-4">
                <Icon name="soldier" size="xl" className="text-military-gold mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-premium-white mb-3">Leadership</h3>
              <p className="text-gray-300">Leading by example in veteran support and career development.</p>
            </div>
            
            <div className="military-card text-center">
              <div className="text-4xl mb-4">
                <Icon name="medal" size="xl" className="text-military-gold mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-premium-white mb-3">Integrity</h3>
              <p className="text-gray-300">Maintaining the highest standards of honesty and transparency.</p>
            </div>
            
            <div className="military-card text-center">
              <div className="text-4xl mb-4">
                <Icon name="trophy" size="xl" className="text-military-gold mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-premium-white mb-3">Discipline</h3>
              <p className="text-gray-300">Consistent, focused approach to achieving our mission.</p>
            </div>
            
            <div className="military-card text-center">
              <div className="text-4xl mb-4">
                <Icon name="people" size="xl" className="text-military-gold mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-premium-white mb-3">Teamwork</h3>
              <p className="text-gray-300">Collaborating with veterans, supporters, and partners.</p>
            </div>
            
            <div className="military-card text-center">
              <div className="text-4xl mb-4">
                <Icon name="target" size="xl" className="text-military-gold mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-premium-white mb-3">Innovation</h3>
              <p className="text-gray-300">Leveraging AI and technology for veteran success.</p>
            </div>
            
            <div className="military-card text-center">
              <div className="text-4xl mb-4">
                <Icon name="heart" size="xl" className="text-military-gold mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-premium-white mb-3">Compassion</h3>
              <p className="text-gray-300">Understanding and addressing veteran needs with empathy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-premium-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Every contribution directly supports veteran career transitions. Help us build the future our heroes deserve.
          </p>
          <button
            onClick={() => setShowDonationModal(true)}
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 font-semibold shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 transition"
            style={{
              color: "#0F0F0F",
              backgroundImage: "linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)",
              boxShadow: "0 0 0 2px rgba(212,175,55,0.4), 0 8px 30px rgba(0,0,0,0.6)"
            }}
          >
            Support Veterans Now
          </button>
        </div>
      </section>

      {/* Modals */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSuccess={(data) => {
          console.log('Donation successful:', data)
          setShowDonationModal(false)
        }}
      />

      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  )
}
