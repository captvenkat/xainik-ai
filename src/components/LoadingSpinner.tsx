'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  timeout?: number
  onTimeout?: () => void
  showRetry?: boolean
  onRetry?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({
  message = 'Loading...',
  timeout = 15000, // 15 seconds default
  onTimeout,
  showRetry = true,
  onRetry,
  size = 'md',
  className = ''
}: LoadingSpinnerProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true)
      onTimeout?.()
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout, onTimeout])

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true)
      setHasTimedOut(false)
      try {
        await onRetry()
      } finally {
        setIsRetrying(false)
      }
    } else {
      // Default retry behavior - reload the page
      window.location.reload()
    }
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  if (hasTimedOut) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <AlertTriangle className={`${sizeClasses[size]} text-yellow-500 mb-4`} />
        <p className="text-gray-600 mb-4 text-center">
          {message} is taking longer than expected.
        </p>
        {showRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mb-4`} />
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  )
}
