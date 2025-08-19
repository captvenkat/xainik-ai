'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { voteOnSuggestion } from '@/lib/services/voting'
import { VoteResponse } from '../../types/voting'

interface VoteButtonsProps {
  suggestionId: string
  initialVotes: number
  initialUserVote?: 'upvote' | 'downvote' | null
  onVoteChange?: (newVotes: number, userVote: 'upvote' | 'downvote' | null) => void
  disabled?: boolean
}

export default function VoteButtons({
  suggestionId,
  initialVotes,
  initialUserVote,
  onVoteChange,
  disabled = false
}: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(initialUserVote || null)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (disabled || isVoting) return

    setIsVoting(true)
    
    try {
      const response: VoteResponse = await voteOnSuggestion(suggestionId, voteType)
      
      if (response.success) {
        let newVotes = votes
        let newUserVote = userVote

        switch (response.action) {
          case 'added':
            newVotes = votes + (voteType === 'upvote' ? 1 : -1)
            newUserVote = voteType
            break
          case 'changed':
            if (userVote === 'upvote' && voteType === 'downvote') {
              newVotes = votes - 2 // Remove upvote, add downvote
            } else if (userVote === 'downvote' && voteType === 'upvote') {
              newVotes = votes + 2 // Remove downvote, add upvote
            }
            newUserVote = voteType
            break
          case 'removed':
            newVotes = votes - (voteType === 'upvote' ? 1 : -1)
            newUserVote = null
            break
        }

        setVotes(newVotes)
        setUserVote(newUserVote)
        
        if (onVoteChange) {
          onVoteChange(newVotes, newUserVote)
        }
      } else {
        console.error('Voting failed:', response.error)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Voting error:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const getVoteButtonClass = (voteType: 'upvote' | 'downvote') => {
    const baseClass = 'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium'
    
    if (userVote === voteType) {
      return `${baseClass} ${
        voteType === 'upvote' 
          ? 'bg-green-100 text-green-700 border border-green-300' 
          : 'bg-red-100 text-red-700 border border-red-300'
      }`
    }
    
    return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200`
  }

  return (
    <div className="flex items-center gap-2">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('upvote')}
        disabled={disabled || isVoting}
        className={`${getVoteButtonClass('upvote')} ${
          disabled || isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title={userVote === 'upvote' ? 'Remove upvote' : 'Upvote'}
      >
        <ThumbsUp className={`w-4 h-4 ${userVote === 'upvote' ? 'fill-current' : ''}`} />
        <span className="text-sm">
          {userVote === 'upvote' ? 'Upvoted' : 'Upvote'}
        </span>
      </button>

      {/* Vote Count */}
      <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
        <span className={`text-sm font-semibold ${
          votes > 0 ? 'text-green-600' : 
          votes < 0 ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {votes > 0 ? '+' : ''}{votes}
        </span>
      </div>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('downvote')}
        disabled={disabled || isVoting}
        className={`${getVoteButtonClass('downvote')} ${
          disabled || isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title={userVote === 'downvote' ? 'Remove downvote' : 'Downvote'}
      >
        <ThumbsDown className={`w-4 h-4 ${userVote === 'downvote' ? 'fill-current' : ''}`} />
        <span className="text-sm">
          {userVote === 'downvote' ? 'Downvoted' : 'Downvote'}
        </span>
      </button>

      {/* Loading Indicator */}
      {isVoting && (
        <div className="ml-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
