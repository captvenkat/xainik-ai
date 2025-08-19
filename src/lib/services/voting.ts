import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { VoteResponse, CommunitySuggestionWithVotes } from '@/types/voting'

const supabase = createSupabaseBrowser()

export async function voteOnSuggestion(
  suggestionId: string, 
  voteType: 'upvote' | 'downvote'
): Promise<VoteResponse> {
  try {
    const { data, error } = await supabase.rpc('vote_on_suggestion', {
      p_suggestion_id: suggestionId,
      p_vote_type: voteType
    })

    if (error) {
      console.error('Voting error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return data as VoteResponse
  } catch (error) {
    console.error('Voting error:', error)
    return {
      success: false,
      error: 'Failed to vote on suggestion'
    }
  }
}

export async function getCommunitySuggestionsWithVotes(): Promise<CommunitySuggestionWithVotes[]> {
  try {
    const { data, error } = await supabase
      .from('community_suggestions_with_votes')
      .select('*')
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching suggestions with votes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching suggestions with votes:', error)
    return []
  }
}

export async function getUserVoteOnSuggestion(suggestionId: string): Promise<'upvote' | 'downvote' | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_vote_on_suggestion', {
      p_suggestion_id: suggestionId
    })

    if (error) {
      console.error('Error getting user vote:', error)
      return null
    }

    return data as 'upvote' | 'downvote' | null
  } catch (error) {
    console.error('Error getting user vote:', error)
    return null
  }
}
