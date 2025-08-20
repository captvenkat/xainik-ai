// Voting System Types

export interface CommunitySuggestionVote {
  id: string
  user_id: string
  suggestion_id: string
  vote_type: 'upvote' | 'downvote'
  created_at: string
  updated_at: string
}

export interface CommunitySuggestionWithVotes {
  id: string
  user_id: string
  title: string
  description?: string
  suggestion_type: 'feature' | 'improvement' | 'bug'
  status: 'active' | 'implemented' | 'rejected' | 'pending'
  priority: 'low' | 'medium' | 'high'
  votes: number
  created_at: string
  updated_at: string
  user_name?: string
  user_vote?: 'upvote' | 'downvote' | null
  upvote_count: number
  downvote_count: number
}

export interface VoteResponse {
  success: boolean
  action?: 'added' | 'changed' | 'removed'
  vote_type?: 'upvote' | 'downvote'
  error?: string
  data?: any
}

export interface VotingStats {
  total_votes: number
  upvotes: number
  downvotes: number
  net_score: number
}
