'use client';
import { useEffect, useRef, useState } from 'react';
import PosterCard from './PosterCard';

type Meme = {
  id:string; output_l1:string; output_l2:string; tagline?:string;
  bg_key:string; name_label:string; created_at:string; theme_id?:string;
};

export default function MasonryFeed() {
  const [items,setItems]=useState<Meme[]>([]);
  const [cursor,setCursor]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const sentinel = useRef<HTMLDivElement|null>(null);

  async function fetchPage() {
    if (loading) return;
    setLoading(true);
    try {
      const url = cursor ? `/api/feed?cursor=${encodeURIComponent(cursor)}` : '/api/feed';
      const r = await fetch(url);
      const j = await r.json();
      const next:Meme[] = j?.items || [];
      setItems(prev => prev.concat(next));
      if (next.length) setCursor(next[next.length-1].created_at); else setCursor(null);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ fetchPage(); },[]);
  useEffect(()=>{
    if(!sentinel.current) return;
    const io = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting && !loading && cursor!==null) fetchPage(); });
    },{ rootMargin: '900px' });
    io.observe(sentinel.current);
    return ()=>io.disconnect();
  },[cursor,loading]);

  function share(id:string){
    const caption = "I unlocked a veteran skill. What's your impossible?";
    const url = `${location.origin}/p/${id}`;
    const text = `${caption} ${url}`;
    if (navigator.share) navigator.share({ text, url }).catch(()=>navigator.clipboard.writeText(text));
    else { navigator.clipboard.writeText(text); alert('Link copied'); }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-3">
      <section className="masonry md:columns-3 columns-2">
        {items.map(m => {
          const bgUrl = `${base}/storage/v1/object/public/backgrounds/${m.bg_key}`;
          return (
            <div key={m.id} className="break-inside-avoid">
              <PosterCard
                bgUrl={bgUrl}
                l1={m.output_l1}
                l2={m.output_l2}
                tagline={m.tagline || 'IMPOSSIBLE IS ROUTINE.'}
                themeId={m.theme_id || m.id}    // fallback to id for deterministic pick
                seed={m.id}
                onShare={()=>share(m.id)}
                onRemix={()=>location.assign(`/remix/${m.id}`)}
                onLike={()=>fetch('/api/like',{method:'POST', body: JSON.stringify({id:m.id})})}
                onDonate={()=>location.assign('/donate')}
              />
              <div className="mt-1 text-xs text-white/70 text-center">{m.name_label}</div>
            </div>
          );
        })}
      </section>
      <div ref={sentinel} className="h-12 flex items-center justify-center text-white/70 text-sm">
        {loading ? "Loading…" : ""}
      </div>
    </div>
  );
}
