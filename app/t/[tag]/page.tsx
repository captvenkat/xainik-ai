'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

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

type FeedResponse = {
  items: Poster[];
  nextCursor: string | null;
};

const SORT_OPTIONS = ['Latest', 'Trending', 'Most Liked', 'Most Shared'];

export default function TagFeed() {
  const params = useParams();
  const tag = params.tag as string;
  
  const [selectedSort, setSelectedSort] = useState('Latest');
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchPosters = async (sort: string, after?: string) => {
    try {
      const params = new URLSearchParams({
        sort: sort.toLowerCase().replace(' ', '_'),
        tag,
        ...(after && { after }),
      });
      
      const response = await fetch(`/api/feed?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data: FeedResponse = await response.json();
      
      if (after) {
        setPosters(prev => [...prev, ...data.items]);
      } else {
        setPosters(data.items);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters(selectedSort);
  }, [selectedSort, tag]);

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    setLoading(true);
    setError(null);
  };

  const handleBackToLatest = () => {
    window.location.href = '/';
  };

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">{error}</p>
          <button 
            onClick={() => fetchPosters(selectedSort)}
            className="px-6 py-2 bg-white text-black font-bold rounded"
          >
            Reload
          </button>
        </div>
      </main>
    );
  }

  if (posters.length === 0 && !loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Nothing here yet.</p>
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
    <main className="min-h-screen bg-black text-white">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-center text-2xl font-black">XAINIK</h1>
        </div>
      </nav>

      {/* Hero line */}
      <div className="sticky top-16 z-40 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <p className="text-center text-lg font-bold">Experience. Not certificates.</p>
        </div>
      </div>

      {/* Section title */}
      <div className="sticky top-28 z-30 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <h2 className="text-center text-xl font-bold">The Military Experience</h2>
        </div>
      </div>

      {/* Sticky chips */}
      <div className="sticky top-40 z-20 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Sort chips */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {SORT_OPTIONS.map((sort) => (
              <button
                key={sort}
                onClick={() => handleSortChange(sort)}
                className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${
                  selectedSort === sort
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
          
          {/* Selected tag chip */}
          <div className="flex gap-2 overflow-x-auto">
            <button className="px-4 py-2 rounded-full font-bold whitespace-nowrap bg-white text-black">
              {tag}
            </button>
          </div>
        </div>
      </div>

      {/* Poster wall */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {posters.map((poster) => (
            <Link key={poster.id} href={`/p/${poster.slug}`}>
              <div className="aspect-[4/5] relative rounded-lg overflow-hidden">
                <Image
                  src={poster.thumb_url}
                  alt={`Cinematic abstract military scene; title: ${poster.title_line}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </Link>
          ))}
        </div>
        
        {loading && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white/10 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
