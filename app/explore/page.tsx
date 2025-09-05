'use client';
import { MemeWall } from '@/components/MemeWall';
import Link from 'next/link';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-white/60 hover:text-white mb-4 inline-block">
            ← Back to Generator
          </Link>
          <h1 className="text-4xl font-black text-white mb-4">Explore Memes</h1>
          <p className="text-white/60 text-lg">Discover military skills unlocked by the community</p>
        </div>

        {/* Meme Wall */}
        <MemeWall />
      </div>
    </div>
  );
}
