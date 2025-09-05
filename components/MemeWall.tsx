'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type FilterType = 'newest' | 'most-liked' | 'most-shared' | 'most-remixed';

interface PublishedMeme {
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

export function MemeWall() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('newest');
  const [memes, setMemes] = useState<PublishedMeme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemes(activeFilter);
  }, [activeFilter]);

  async function fetchMemes(filter: FilterType) {
    setLoading(true);
    try {
      const response = await fetch(`/api/feed?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setMemes(data.memes || []);
      }
    } catch (error) {
      console.error('Failed to fetch memes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filters = [
    { key: 'newest', label: 'Newest', icon: '🆕' },
    { key: 'most-liked', label: 'Most Liked', icon: '❤️' },
    { key: 'most-shared', label: 'Most Shared', icon: '🔗' },
    { key: 'most-remixed', label: 'Most Remixed', icon: '🎨' }
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/60">Loading meme wall...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as FilterType)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold whitespace-nowrap transition-all duration-200 ${
              activeFilter === filter.key
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Memes Grid */}
      {memes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">No memes yet. Be the first to unlock a military skill!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memes.map((meme) => (
            <MemeCard key={meme.id} meme={meme} />
          ))}
        </div>
      )}
    </div>
  );
}

function MemeCard({ meme }: { meme: PublishedMeme }) {
  return (
    <div className="group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        {/* Meme Image */}
        <div className="relative aspect-[4/5] w-full">
          <img
            src={meme.imageUrl}
            alt={meme.line}
            className="w-full h-full object-cover"
          />
          {/* Mode Badge */}
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold ${
            meme.mode === 'inspiration' 
              ? 'bg-blue-500 text-white' 
              : 'bg-yellow-500 text-black'
          }`}>
            {meme.mode === 'inspiration' ? '✨' : '😂'}
          </div>
          
          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Link 
                href={`/p/${meme.id}`}
                className="px-4 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors"
              >
                👁️ View
              </Link>
              <Link 
                href={`/edit/${meme.id}`}
                className="px-4 py-2 bg-purple-500 text-white font-bold rounded-full hover:bg-purple-600 transition-colors"
              >
                🎨 Remix
              </Link>
            </div>
          </div>
        </div>
        
        {/* Meme Info */}
        <div className="p-3">
          {/* Meme Text */}
          <p className="text-sm font-bold text-gray-800 mb-2 line-clamp-2">
            {meme.line}
          </p>
          
          {/* Creator */}
          <p className="text-xs text-gray-600 mb-2">
            Created by {meme.creatorName}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              ❤️ {meme.likes}
            </span>
            <span className="flex items-center gap-1">
              🔗 {meme.shares}
            </span>
            <span className="flex items-center gap-1">
              🎨 {meme.remixCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
