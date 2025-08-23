'use client'

import React from 'react'

interface SmartImageProps {
  src?: string
  alt: string
  fallbackLabel: string
  className?: string
  aspectRatio?: '4:3' | '16:9' | '1:1'
}

export function SmartImage({ 
  src, 
  alt, 
  fallbackLabel, 
  className = '',
  aspectRatio = '4:3'
}: SmartImageProps) {
  const [hasError, setHasError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!src) {
      setHasError(true)
      setIsLoading(false)
    }
  }, [src])

  const aspectRatioClasses = {
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-[16/9]',
    '1:1': 'aspect-square'
  }

  if (!src || hasError) {
    return (
      <div className={`${aspectRatioClasses[aspectRatio]} rounded-xl border border-gray-200 p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${className}`}>
        <div className="space-y-2">
          <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-400 rounded"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">{fallbackLabel}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${aspectRatioClasses[aspectRatio]} relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded animate-spin"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        className={`w-full h-full object-cover rounded-xl border border-gray-200 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        loading="lazy"
      />
    </div>
  )
}
