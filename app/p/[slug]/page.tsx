'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

type Poster = {
  id: string;
  slug: string;
  title_line: string;
  contrast_line: string;
  image_url: string;
  og_image_url: string;
  thumb_url: string;
  likes: number;
  views: number;
  shares: number;
  created_at: string;
};

export default function PosterViewer() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [poster, setPoster] = useState<Poster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  const fetchPoster = async () => {
    try {
      // For now, we'll use the feed API to get poster data
      // In a real implementation, you'd have a dedicated poster API
      const response = await fetch('/api/feed?sort=latest');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const foundPoster = data.items.find((p: Poster) => p.slug === slug || p.id === slug);
      
      if (!foundPoster) {
        setError('Poster not available.');
        return;
      }
      
      setPoster(foundPoster);
      setLikes(foundPoster.likes);
      setShares(foundPoster.shares);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoster();
  }, [slug]);

  // Track view after 1.5 seconds
  useEffect(() => {
    if (poster && !viewTracked) {
      const timer = setTimeout(() => {
        fetch('/api/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ posterId: poster.id }),
        }).catch(console.error);
        setViewTracked(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [poster, viewTracked]);

  const handleLike = async () => {
    if (!poster) return;
    
    // Optimistic update
    setLikes(prev => prev + 1);
    
    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posterId: poster.id }),
      });
    } catch (err) {
      // Revert on error
      setLikes(prev => prev - 1);
    }
  };

  const handleShare = async () => {
    if (!poster) return;
    
    try {
      // Track share first
      await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posterId: poster.id }),
      });
      
      setShares(prev => prev + 1);
      
      // Open native share
      if (navigator.share) {
        await navigator.share({
          title: poster.title_line,
          text: 'Natural Leaders — Experience. Not certificates.',
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleBackToLatest = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !poster) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">{error || 'Poster not available.'}</p>
          <button 
            onClick={handleBackToLatest}
            className="px-6 py-2 bg-white text-black font-bold rounded"
          >
            Back to Latest
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Full-screen poster */}
      <div className="relative w-full h-screen">
        <Image
          src={poster.image_url}
          alt={`Cinematic abstract military scene; title: ${poster.title_line}`}
          fill
          className="object-cover"
          priority
        />
        
        {/* Double-tap overlay for like */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onDoubleClick={handleLike}
        />
        
        {/* Share button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full backdrop-blur-sm"
        >
          Share
        </button>
      </div>

      {/* Bottom sheet */}
      <div className={`fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm transition-transform duration-300 ${
        sheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Drag handle */}
          <div 
            className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4 cursor-pointer"
            onClick={() => setSheetExpanded(!sheetExpanded)}
          />
          
          {/* Content */}
          <div className="text-center">
            <h1 className="text-2xl font-black mb-2">{poster.title_line}</h1>
            <p className="text-lg font-bold mb-2">Natural Leaders</p>
            <p className="text-sm mb-4">{poster.contrast_line}</p>
            
            {/* Counters */}
            <div className="flex justify-center gap-6 text-sm">
              <span>♥ {likes}</span>
              <span>Share {shares}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
