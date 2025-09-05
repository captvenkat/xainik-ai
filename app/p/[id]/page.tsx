'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Meme {
  id: string;
  mode: 'humor' | 'inspiration';
  line: string;
  bgKey: string;
  imageUrl: string;
  creatorName: string;
  likes: number;
  shares: number;
  remixCount: number;
  createdAt: string;
  parentId?: string;
}

interface ParentMeme {
  id: string;
  line: string;
  creatorName: string;
}

export default function MemePage() {
  const params = useParams();
  const memeId = params.id as string;
  
  const [meme, setMeme] = useState<Meme | null>(null);
  const [parentMeme, setParentMeme] = useState<ParentMeme | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showRemixForm, setShowRemixForm] = useState(false);
  const [creatorName, setCreatorName] = useState('');

  useEffect(() => {
    if (memeId) {
      fetchMeme(memeId);
    }
  }, [memeId]);

  async function fetchMeme(id: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/meme/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMeme(data.meme);
        
        // Fetch parent meme if this is a remix
        if (data.meme.parentId) {
          fetchParentMeme(data.meme.parentId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch meme:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchParentMeme(parentId: string) {
    try {
      const response = await fetch(`/api/meme/${parentId}`);
      if (response.ok) {
        const data = await response.json();
        setParentMeme(data.meme);
      }
    } catch (error) {
      console.error('Failed to fetch parent meme:', error);
    }
  }

  async function handleLike() {
    if (!meme) return;
    
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId: meme.id })
      });
      
      if (response.ok) {
        setLiked(!liked);
        setMeme(prev => prev ? { ...prev, likes: liked ? prev.likes - 1 : prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error('Like failed:', error);
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Military Skill Unlocked',
          text: 'I unlocked a military skill on Xainik. Your turn.',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(
          `I unlocked a military skill on Xainik. Your turn.\n${window.location.href}`
        );
      }
      
      // Increment share count
      setMeme(prev => prev ? { ...prev, shares: prev.shares + 1 } : null);
      
      // Show donation toast
      setTimeout(() => {
        alert('✅ Shared! Want to support veterans? [Donate ₹99]');
      }, 1000);
      
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  async function handleRemix() {
    if (!meme) return;
    
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: meme.id,
          mode: meme.mode,
          creatorName: creatorName.trim() || 'Supporter of Military'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Remixed! Another skill unlocked.');
        // Redirect to home to generate new meme
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Remix failed:', error);
      alert('Failed to remix. Please try again!');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading meme...</p>
        </div>
      </div>
    );
  }

  if (!meme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">Meme not found</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center space-x-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/community" className="hover:text-white transition-colors">
              Community
            </Link>
            <span>/</span>
            <span className="text-white">View Meme</span>
          </nav>
          
          <Link href="/" className="text-white/60 hover:text-white mb-4 inline-block">
            ← Back to Generator
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Military Skill Unlocked</h1>
          <p className="text-white/60">Share this inspiration with the world</p>
        </div>

        {/* Meme Display */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl mb-8">
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl">
            <img
              src={meme.imageUrl}
              alt={meme.line}
              className="w-full h-full object-cover"
            />
            {/* Mode Badge */}
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold ${
              meme.mode === 'inspiration' 
                ? 'bg-blue-500 text-white' 
                : 'bg-yellow-500 text-black'
            }`}>
              {meme.mode === 'inspiration' ? '✨ Inspiration' : '😂 Humor'}
            </div>
          </div>
        </div>

        {/* Meme Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-white mb-4">{meme.line}</p>
            <p className="text-white/80">Created by {meme.creatorName}</p>
          </div>

          {/* Lineage Info */}
          {parentMeme && (
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-white/60 text-sm mb-2">Remixed from:</p>
              <Link href={`/p/${parentMeme.id}`} className="block">
                <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors">
                  <p className="text-white font-medium">{parentMeme.line}</p>
                  <p className="text-white/60 text-sm">by {parentMeme.creatorName}</p>
                </div>
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{meme.likes}</div>
              <div className="text-white/60 text-sm">Likes</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{meme.shares}</div>
              <div className="text-white/60 text-sm">Shares</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{meme.remixCount}</div>
              <div className="text-white/60 text-sm">Remixes</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={handleShare}
            className="flex-1 py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors duration-200 shadow-lg"
          >
            🔗 Share
          </button>
          <button
            onClick={handleLike}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-colors duration-200 shadow-lg ${
              liked 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
          >
            ❤️ {liked ? 'Liked' : 'Like'}
          </button>
        </div>

        {/* Remix Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Create Your Own Remix</h3>
          
          {!showRemixForm ? (
            <button
              onClick={() => setShowRemixForm(true)}
              className="w-full py-4 px-6 rounded-2xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors duration-200 shadow-lg"
            >
              🎨 Remix This Meme
            </button>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRemix}
                  className="flex-1 py-3 px-6 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors duration-200"
                >
                  🎨 Create Remix
                </button>
                <button
                  onClick={() => setShowRemixForm(false)}
                  className="px-6 py-3 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
              <p className="text-white/60 text-sm text-center">
                Leave blank to show as "Supporter of Military"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
