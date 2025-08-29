'use client'

import { useState } from 'react'
import DonationModal from './DonationModal'

export default function Hero() {
  const [isDonating, setIsDonating] = useState(false)
  const [showDonationModal, setShowDonationModal] = useState(false)

  const handleDonate = () => {
    setShowDonationModal(true)
  }

  const handleDonationSuccess = (data: any) => {
    setIsDonating(true)
    // TODO: Show success message and share popup
    console.log('Donation successful:', data)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Xainik - Veteran Success Foundation',
        text: 'Our soldiers stood for us. Today I stood for them. Backed Xainik, an AI-first nonprofit helping veterans build their second innings. You can too!',
        url: 'https://xainik.in',
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText('https://xainik.in')
      alert('Link copied to clipboard!')
    }
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            They gave it all during service.
            <br />
            <span className="text-red-600">Now they struggle to get jobs after service.</span>
            <br />
            <span className="text-blue-600">Xainik changes that.</span>
          </h1>

          {/* Subline */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            <strong>Xainik is an initiative by the Veteran Success Foundation</strong> — a registered Sec-8 Nonprofit committed to helping soldiers succeed beyond service.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-medium">Sec-8 Nonprofit</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-medium">20 Years Experience</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleDonate}
              disabled={isDonating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:transform-none"
            >
              {isDonating ? 'Processing...' : 'Donate Now → Secure via Razorpay'}
            </button>
            
            <button
              onClick={handleShare}
              className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-8 rounded-full text-lg shadow-lg border-2 border-gray-200 transform transition-all duration-200 hover:scale-105"
            >
              Share → Tell 5 Friends
            </button>
          </div>

          {/* Microcopy */}
          <p className="text-sm text-gray-500 mt-6 max-w-2xl mx-auto">
            We are a registered Sec-8 Nonprofit. Every rupee is reinvested. All documents open.
          </p>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSuccess={handleDonationSuccess}
      />
    </>
  )
}
