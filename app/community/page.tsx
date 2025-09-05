'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MemeWall } from '@/components/MemeWall';

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748]">
      {/* Header with Breadcrumbs */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Community</span>
          </nav>
          
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Community Meme Wall
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Explore military skills unlocked by veterans and supporters worldwide. 
              Get inspired, share your favorites, and unlock your own skills.
            </p>
            
            {/* CTA Button */}
            <div className="mt-8">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-2xl hover:from-yellow-400 hover:to-orange-400 transform hover:scale-105 transition-all duration-200 shadow-2xl"
              >
                🚀 Unlock Your Military Skill
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Meme Wall Content */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <MemeWall />
        </div>
      </section>

      {/* Sticky Donate Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-r from-white to-gray-100 text-black py-3 px-4 shadow-2xl z-40">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🪖</span>
            <div>
              <p className="text-sm font-semibold">10,00,000 retired soldiers need meaningful jobs</p>
              <p className="text-xs opacity-90">Your ₹99 helps unlock their potential</p>
            </div>
          </div>
          <a 
            href="/donate" 
            className="px-6 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Donate ₹99
          </a>
        </div>
      </div>
    </main>
  );
}
