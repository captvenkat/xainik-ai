'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Meme {
  id: string;
  output_l1: string;
  bg_key: string;
  name_label: string;
  tagline: string;
  created_at: string;
}

export default function EditMemePage() {
  const params = useParams();
  const memeId = params.id as string;
  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    fetchMeme();
  }, [memeId]);

  async function fetchMeme() {
    try {
      const response = await fetch(`/api/meme/${memeId}`);
      if (response.ok) {
        const data = await response.json();
        setMeme(data.meme);
        setNewText(data.meme.output_l1);
      }
    } catch (error) {
      console.error('Failed to fetch meme:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemix() {
    if (!newText.trim()) return;
    
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: memeId,
          line: newText,
          creatorName: 'Remixed by You'
        })
      });

      if (response.ok) {
        alert('🎨 Meme remixed successfully! Redirecting to Community...');
        window.location.href = '/community';
      }
    } catch (error) {
      console.error('Remix failed:', error);
      alert('Failed to remix meme. Please try again!');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading meme...</p>
        </div>
      </main>
    );
  }

  if (!meme) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">Meme not found</p>
          <Link href="/community" className="text-white hover:text-yellow-400">
            ← Back to Community
          </Link>
        </div>
      </main>
    );
  }

  const imageUrl = `https://byleslhlkakxnsurzyzt.supabase.co/storage/v1/object/public/backgrounds/military/${meme.bg_key}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748]">
      {/* Header with Breadcrumbs */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/community" className="hover:text-white transition-colors">
              Community
            </Link>
            <span>/</span>
            <span className="text-white">Edit Meme</span>
          </nav>
          
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Edit & Remix Meme
            </h1>
            <p className="text-white/80">
              Modify this military skill meme and make it your own
            </p>
          </div>
        </div>
      </header>

      {/* Edit Content */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Original Meme */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Original Meme</h3>
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Original meme"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="text-white text-xl font-black leading-tight">
                        {meme.output_l1}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-white/80 text-sm">
                  <p>Created by: {meme.name_label}</p>
                  <p>Date: {new Date(meme.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Your Remix</h3>
              <div className="bg-white/10 rounded-2xl p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Meme Text
                    </label>
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Enter your remixed meme text..."
                      className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleRemix}
                      disabled={!newText.trim() || editing}
                      className="flex-1 py-3 px-6 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      {editing ? 'Remixing...' : '🎨 Remix Meme'}
                    </button>
                    <Link
                      href="/community"
                      className="py-3 px-6 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
