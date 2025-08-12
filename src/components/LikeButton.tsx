"use client"

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { likePitch, unlikePitch } from '@/lib/actions/likePitch'


interface LikeButtonProps {
  pitchId: string
  initialCount: number
  userId?: string
}

export default function LikeButton({ pitchId, initialCount, userId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [pending, start] = useTransition()

  const onLike = () => {
    if (pending || !userId) return
    
    const prevLiked = liked
    const prevCount = count

    // Optimistic update
    if (!liked) {
      setLiked(true)
      setCount((c) => c + 1)
    } else {
      setLiked(false)
      setCount((c) => Math.max(0, c - 1))
    }

    start(async () => {
      try {
        const res = liked 
          ? await unlikePitch(pitchId, userId)
          : await likePitch(pitchId, userId)
        
        if (res.success) {
          // Keep the optimistic update
        } else {
          // Rollback on error
          setLiked(prevLiked)
          setCount(prevCount)
        }
      } catch (error) {
        // Rollback on error
        setLiked(prevLiked)
        setCount(prevCount)
      }
    })
  }

  return (
    <button 
      aria-pressed={liked} 
      aria-label="Like" 
      onClick={onLike} 
      disabled={!userId || pending}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        liked 
          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
          : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
      } ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
      <span className="text-sm font-medium">{count}</span>
    </button>
  )
}
