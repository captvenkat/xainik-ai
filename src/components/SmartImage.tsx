'use client'

import * as React from 'react';

export function SmartImage({
  src,
  alt,
  fallbackLabel,
  className = 'rounded-2xl border shadow-sm w-full h-full object-cover'
}: { 
  src?: string; 
  alt: string; 
  fallbackLabel: string; 
  className?: string 
}) {
  const [err, setErr] = React.useState(false);
  
  if (!src || err) {
    return (
      <div className="rounded-2xl border shadow-sm p-6 text-sm text-muted-foreground bg-muted/30 flex items-center justify-center min-h-[220px]">
        {fallbackLabel}
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      onError={() => setErr(true)} 
      className={className} 
      loading="lazy" 
    />
  );
}
