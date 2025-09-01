'use client';
import { useState } from 'react';
import MasonryFeed from '@/components/MasonryFeed';
import HeroDemo from '@/components/HeroDemo';

export default function Home(){
  const [input,setInput]=useState(''); 
  const [loading,setLoading]=useState(false);
  const [gen,setGen]=useState<{poster:string;bg_key:string;input:string}|null>(null);
  const [showPreview,setShowPreview]=useState(false);

  async function generate(){
    if (!input.trim()) {
      alert('Please enter what feels impossible to you!');
      return;
    }
    
    setLoading(true);
    try {
      const r = await fetch('/api/generate',{method:'POST',body:JSON.stringify({text:input})});
      const j = await r.json(); 
      setGen(j);
      setShowPreview(true);
      
      // Smooth scroll to preview
      setTimeout(() => {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      alert('Failed to generate poster. Please try again!');
    } finally { 
      setLoading(false); 
    }
  }

  async function publishPoster() {
    if (!gen) return;
    
    const name_label = prompt('Name for credit? (or leave blank for Anonymous)') || 'Anonymous';
    
    try {
      const [l1, , l2, , l3] = gen.poster.split('\n');
      const res = await fetch('/api/publish', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          input_text: gen.input, 
          l1, 
          l2, 
          tagline: l3, 
          bg_key: gen.bg_key, 
          name_label
        }) 
      });
      
      const j = await res.json();
      if (j?.id) {
        alert('🎉 Your poster is live! Share it with the world!');
        setShowPreview(false);
        setGen(null);
        setInput('');
        // Refresh the feed
        window.location.reload();
      } else {
        alert('Poster created but failed to save. Try again!');
      }
    } catch (error) {
      alert('Failed to publish. Please try again!');
    }
  }

  function skipToRandom() {
    const examples = ['deadlines', 'traffic', 'Mondays', 'emails', 'meetings', 'presentations'];
    const random = examples[Math.floor(Math.random() * examples.length)];
    setInput(random);
    generate();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748]">
      {/* Sticky Hero Generator */}
      <section className="sticky top-0 z-50 bg-gradient-to-b from-[#0B1220]/95 to-[#0B1220]/80 backdrop-blur-md border-b border-white/10 px-4 pt-6 pb-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
            IMPOSSIBLE IS ROUTINE.
          </h1>
          <p className="text-white/80 text-sm mb-4">What's your impossible?</p>
          
          {/* Input Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input 
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              maxLength={120}
              placeholder="What's your impossible?" 
              className="flex-1 rounded-2xl px-6 py-4 text-lg text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-200 shadow-lg" 
            />
            <button 
              onClick={generate} 
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          
          {/* Skip Button */}
          <button 
            onClick={skipToRandom}
            className="text-white/70 text-sm hover:text-white transition-colors duration-200"
          >
            Skip → Random
          </button>
        </div>
      </section>

      {/* Hero Demo - Shows premium examples */}
      <HeroDemo />

      {/* Preview Section with Smooth Animation */}
      {showPreview && gen && (
        <section id="preview-section" className="px-4 py-8 bg-white/5 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Your Generated Poster</h2>
            
            {/* Poster Preview */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/backgrounds/${gen.bg_key}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="space-y-2 mb-4">
                    <p className="text-lg font-semibold leading-tight drop-shadow-lg">{gen.poster.split('\n')[0]}</p>
                    <p className="text-lg font-semibold leading-tight drop-shadow-lg">{gen.poster.split('\n')[2]}</p>
                    <p className="text-2xl font-black tracking-wide drop-shadow-lg">{gen.poster.split('\n')[4] || 'IMPOSSIBLE IS ROUTINE.'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={publishPoster}
                className="px-8 py-3 rounded-2xl bg-white text-black font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🚀 Publish & Share
              </button>
              <button 
                onClick={() => setShowPreview(false)}
                className="px-8 py-3 rounded-2xl border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-all duration-200"
              >
                ✏️ Edit & Regenerate
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Modern Masonry Feed */}
      <MasonryFeed />

      {/* Sticky Donate Strip */}
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-r from-white to-gray-100 text-black py-3 px-4 shadow-2xl z-40">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🪖</span>
            <div>
              <p className="text-sm font-semibold">5 lakh veterans need meaningful jobs</p>
              <p className="text-xs opacity-90">Your ₹99 helps unlock their potential</p>
            </div>
          </div>
          <a 
            href="/donate" 
            className="px-6 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Donate Now
          </a>
        </div>
      </div>
    </main>
  );
}
