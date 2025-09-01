'use client';
import { useMemo, useState } from 'react';
import { Heart, Share2, Repeat2, IndianRupee } from 'lucide-react';
import { PosterTheme, pickTheme } from './themes';

type Props = {
  bgUrl: string;
  l1: string;
  l2: string;
  tagline?: string;
  themeId?: string;                   // optional persisted theme id
  seed?: string;                      // e.g., meme id or input; ensures variety
  onShare?: () => void;
  onRemix?: () => void;
  onLike?: () => void;
  onDonate?: () => void;
};

export default function PosterCard({
  bgUrl, l1, l2, tagline="IMPOSSIBLE IS ROUTINE.", themeId, seed,
  onShare, onRemix, onLike, onDonate
}: Props) {
  const [ready,setReady]=useState(false);
  const theme: PosterTheme = useMemo(() => themeId ? (pickTheme(themeId)) : pickTheme(seed), [themeId, seed]);

  // spacing logic: longer lines → slightly bigger gaps
  const words1 = l1.split(/\s+/).length;
  const words2 = l2.split(/\s+/).length;
  const gapBase = 14; // px
  const gap1 = Math.min(28, Math.round((gapBase + words1) * (theme.gapScale ?? 1)));
  const gap2 = Math.min(34, Math.round((gapBase + words2 + 4) * (theme.gapScale ?? 1)));

  const posClass = theme.textPosition === "lower" ? "items-end pb-24"
                 : theme.textPosition === "upper" ? "items-start pt-16"
                 : "items-center";
  const alignClass = theme.textAlign === "left" ? "text-left"
                    : theme.textAlign === "right" ? "text-right" : "text-center";
  const fontClass  = theme.font === "compact" ? "font-[var(--font-headline-compact)]"
                    : "font-[var(--font-headline-rounded)]";
  const shadow = theme.textShadow ? "drop-shadow-[0_2px_8px_rgba(0,0,0,.55)]" : "";

  return (
    <div className="relative aspect-[4/5] w-full rounded-[var(--radius)] overflow-hidden shadow-soft fade-up">
      {/* Background */}
      <img
        src={bgUrl}
        alt=""
        loading="lazy"
        onLoad={()=>setReady(true)}
        onError={()=>setReady(false)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${ready?'opacity-100':'opacity-0'}`}
        style={{ filter: theme.overlay==="duotone" ? "saturate(0.2) contrast(1.1) brightness(0.9)" : "contrast(1.05) saturate(1.05)" }}
      />
      {/* Overlay */}
      {theme.overlay === "vignette" && <div className="absolute inset-0 vignette" />}
      {theme.overlay === "gradient" && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/85" />
      )}
      {theme.overlay === "duotone" && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.75)), linear-gradient(180deg, ${theme.tint}33, transparent)` }} />
      )}

      {/* Copy block */}
      <div className={`absolute inset-0 flex ${posClass} justify-center px-6`}>
        <div className={`mx-auto max-w-[78%] ${alignClass} ${fontClass} will-change-transform`}>
          <p className={`balance text-[clamp(18px,2.2vw,22px)] leading-tight ${shadow}`} style={{ marginBottom: gap1 }}>{l1}</p>
          <p className={`balance text-[clamp(18px,2.2vw,22px)] leading-tight ${shadow}`} style={{ marginBottom: gap2 }}>{l2}</p>
          <p className={`balance text-[clamp(22px,3.0vw,30px)] font-extrabold tracking-wide ${shadow}`}>{tagline}</p>
        </div>
      </div>

      {/* Action chips (glassy) */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button aria-label="Like" onClick={onLike} className="glass rounded-full p-2 hover:bg-white/20 transition"><Heart className="w-4 h-4" /></button>
        <button aria-label="Share this poster" onClick={onShare} className="glass rounded-full p-2 hover:bg-white/20 transition"><Share2 className="w-4 h-4" /></button>
        <button aria-label="Remix with your impossible" onClick={onRemix} className="glass rounded-full p-2 hover:bg-white/20 transition"><Repeat2 className="w-4 h-4" /></button>
        <button aria-label="Donate ₹99" onClick={onDonate} className="glass rounded-full p-2 hover:bg-white/20 transition"><IndianRupee className="w-4 h-4" /></button>
      </div>

      {/* Footer lockup */}
      <div className={`${theme.footer==="glass" ? "glass" : "bg-white text-black"} absolute bottom-0 inset-x-0 border-t border-white/10 px-4 py-2 flex items-center justify-between`}>
        <span className={`text-[13px] font-semibold ${theme.footer==="glass" ? "" : "text-black"}`}>Unlocking Veterans.</span>
        <span className={`text-[12px] opacity-80 ${theme.footer==="glass" ? "" : "text-black/70"}`}>Xainik — Impossible Is Routine.</span>
      </div>

      {/* Skeleton */}
      {!ready && <div className="absolute inset-0 bg-black/25" />}
    </div>
  );
}
