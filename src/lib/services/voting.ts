import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { VoteResponse, CommunitySuggestionWithVotes } from '../../types/voting'

const supabase = createSupabaseBrowser()

export async function voteOnSuggestion(
  suggestionId: string, 
  voteType: 'upvote' | 'downvote'
): Promise<VoteResponse> {
  try {
    // Use the vote_on_suggestion RPC function that exists in live schema
    const { data, error } = await supabase
      .rpc('vote_on_suggestion', {
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

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Voting error:', error)
    return {
      success: false,
      error: 'Failed to submit vote'
    }
  }
}

export async function getCommunitySuggestionsWithVotes(): Promise<CommunitySuggestionWithVotes[]> {
  try {
    // Fetch from community_suggestions_with_votes view that exists in live schema
    const { data, error } = await supabase
      .from('community_suggestions_with_votes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching suggestions with votes:', error)
      return []
    }

    return (data || []) as CommunitySuggestionWithVotes[]
  } catch (error) {
    console.error('Error fetching suggestions with votes:', error)
    return []
  }
}

export async function getUserVoteOnSuggestion(suggestionId: string): Promise<'upvote' | 'downvote' | null> {
  try {
    // Use the get_user_vote_on_suggestion RPC function that exists in live schema
    const { data, error } = await supabase
      .rpc('get_user_vote_on_suggestion', {
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
