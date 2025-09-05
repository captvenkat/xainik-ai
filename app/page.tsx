'use client';
import { useState } from 'react';
import { MemePoster } from '@/components/MemePoster';
import { MemeWall } from '@/components/MemeWall';
import Link from 'next/link';

type MemeMode = 'humor' | 'inspiration';

interface GeneratedMeme {
  id: string;
  line: string;
  bgKey: string;
  imageUrl: string;
  mode: MemeMode;
  isPublished?: boolean;
  publishedId?: string;
}

export default function Home() {
  const [mode, setMode] = useState<MemeMode>('inspiration');
  const [loading, setLoading] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<GeneratedMeme | null>(null);


  async function handleGenerate() {
    setLoading(true);
    try {
      // Generate meme text via API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });

      if (!response.ok) {
        throw new Error('Failed to generate meme');
      }

      const data = await response.json();
      
      // Get Supabase bucket URL for backgrounds
      const supabaseUrl = 'https://byleslhlkakxnsurzyzt.supabase.co'; // Correct Supabase URL
      const backgrounds = [
        'military-01.webp', 'military-02.webp', 'military-03.webp', 'military-04.webp', 'military-05.webp',
        'military-06.webp', 'military-07.webp', 'military-08.webp', 'military-09.webp', 'military-10.webp',
        'military-11.webp', 'military-12.webp', 'military-13.webp', 'military-14.webp', 'military-15.webp',
        'military-16.webp', 'military-17.webp', 'military-18.webp', 'military-19.webp', 'military-20.webp',
        'military-21.webp', 'military-22.webp', 'military-23.webp', 'military-24.webp', 'military-25.webp',
        'military-26.webp', 'military-27.webp', 'military-28.webp', 'military-29.webp', 'military-30.webp',
        'military-31.webp', 'military-32.webp', 'military-33.webp', 'military-34.webp', 'military-35.webp',
        'military-36.webp', 'military-37.webp', 'military-38.webp', 'military-39.webp', 'military-40.webp'
      ];
      
      const bgKey = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      
      // Create meme object with actual Supabase bucket URL
      const meme: GeneratedMeme = {
        id: `meme_${Date.now()}`,
        line: data.line,
        bgKey,
        imageUrl: `${supabaseUrl}/storage/v1/object/public/backgrounds/military/${bgKey}`,
        mode: data.mode,
        isPublished: false
      };

      console.log('Generated meme:', meme); // Debug log
      setGeneratedMeme(meme);
      
      // Auto-scroll to show the generated meme
      setTimeout(() => {
        const memeSection = document.getElementById('generated-meme-section');
        if (memeSection) {
          memeSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to generate meme:', error);
      alert('Failed to generate meme. Please try again!');
    } finally {
      setLoading(false);
    }
  }

  function handleRemix() {
    if (generatedMeme) {
      handleGenerate(); // Re-generate with same mode
    }
  }

  function handlePublish(publishedMeme: GeneratedMeme) {
    // Update the meme to show it's published
    setGeneratedMeme(publishedMeme);
    
    // Show success message and redirect to community
    setTimeout(() => {
      alert('🎉 Meme published successfully! Redirecting to Community Meme Wall...');
      window.location.href = '/community';
    }, 100);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748] pb-32">
      {/* Hero Section - Single Screen, No Scroll */}
      <section className="min-h-screen flex flex-col justify-center px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          {/* Top microline */}
          <p className="text-white/60 text-sm mb-4">
            The world's only AI-powered military skills meme generator.
          </p>
          
          {/* H1 */}
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
            Unlock a military skill.
          </h1>
          
          {/* Sub */}
          <p className="text-white/80 text-lg mb-8">
            Choose your mood.
          </p>
          
          {/* Mode Selection */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setMode('humor')}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 ${
                mode === 'humor'
                  ? 'bg-yellow-500 text-black shadow-lg'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              😂 Humor
            </button>
            <button
              onClick={() => setMode('inspiration')}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 ${
                mode === 'inspiration'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              ✨ Inspiration
            </button>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-xl hover:from-yellow-400 hover:to-orange-400 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                <span>Generating...</span>
              </div>
            ) : (
              'Generate'
            )}
          </button>
          
          {/* Explore Link */}
          <div className="mt-6">
            <Link 
              href="/community" 
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Explore Community Memes →
            </Link>
          </div>
        </div>
      </section>

      {/* Generated Meme Display */}
      {generatedMeme && (
        <section id="generated-meme-section" className="px-4 py-8 bg-white/5 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <MemePoster
              meme={generatedMeme}
              onRemix={handleRemix}
              onPublish={handlePublish}
            />
          </div>
        </section>
      )}



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
