'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Donor Wall', href: '/donor-wall' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '#contact' }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-premium-black/95 backdrop-blur-md border-b border-military-gold/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-military-gold rounded-full flex items-center justify-center text-black font-bold text-lg group-hover:scale-110 transition-transform">
              🎖️
            </div>
            <div className="hidden sm:block">
              <div className="text-premium-white font-bold text-xl group-hover:text-military-gold transition-colors">
                Xainik
              </div>
              <div className="text-gray-400 text-xs">
                Veteran Success Foundation
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-premium-white hover:text-military-gold transition-colors font-medium relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-military-gold transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-4 ml-8">
              <button
                onClick={() => {
                  const event = new CustomEvent('openShareModal')
                  window.dispatchEvent(event)
                }}
                className="inline-flex items-center gap-2 bg-premium-gray/50 hover:bg-premium-gray/70 text-premium-white px-4 py-2 rounded-xl transition-all duration-300 border border-military-gold/30 hover:border-military-gold/50"
              >
                <Icon name="share" size="sm" className="text-premium-white" />
                <span className="hidden lg:inline">Share</span>
              </button>
              
              <button
                onClick={() => {
                  const event = new CustomEvent('openDonationModal')
                  window.dispatchEvent(event)
                }}
                className="inline-flex items-center gap-2 bg-military-gold hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Icon name="heart" size="sm" className="text-black" />
                <span>Donate</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-premium-white hover:text-military-gold transition-colors p-2"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'
                }`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-4 border-t border-military-gold/20">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-premium-white hover:text-military-gold transition-colors font-medium py-2"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile CTA Buttons */}
            <div className="flex flex-col space-y-3 pt-4 border-t border-military-gold/20">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  const event = new CustomEvent('openShareModal')
                  window.dispatchEvent(event)
                }}
                className="inline-flex items-center justify-center gap-2 bg-premium-gray/50 hover:bg-premium-gray/70 text-premium-white px-4 py-3 rounded-xl transition-all duration-300 border border-military-gold/30"
              >
                <Icon name="share" size="sm" className="text-premium-white" />
                <span>Share This Mission</span>
              </button>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  const event = new CustomEvent('openDonationModal')
                  window.dispatchEvent(event)
                }}
                className="inline-flex items-center justify-center gap-2 bg-military-gold hover:bg-yellow-500 text-black font-semibold px-4 py-3 rounded-xl transition-all duration-300"
              >
                <Icon name="heart" size="sm" className="text-black" />
                <span>Donate Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
