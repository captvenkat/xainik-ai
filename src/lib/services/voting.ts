import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { VoteResponse, CommunitySuggestionWithVotes } from '../../types/voting'

const supabase = createSupabaseBrowser()

export async function voteOnSuggestion(
  suggestionId: string, 
  voteType: 'upvote' | 'downvote'
): Promise<VoteResponse> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    // Check if user already voted on this suggestion
    const { data: existingVote } = await supabase
      .from('community_suggestion_votes')
      .select('*')
      .eq('suggestion_id', suggestionId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same button
        const { error: deleteError } = await supabase
          .from('community_suggestion_votes')
          .delete()
          .eq('id', existingVote.id)

        if (deleteError) {
          console.error('Error removing vote:', deleteError)
          return {
            success: false,
            error: 'Failed to remove vote'
          }
        }

        // Update suggestion vote count
        const voteChange = voteType === 'upvote' ? -1 : 1
        const { data: currentSuggestion } = await supabase
          .from('community_suggestions')
          .select('votes')
          .eq('id', suggestionId)
          .single()
        
        const newVoteCount = (currentSuggestion?.votes || 0) + voteChange
        const { error: updateError } = await supabase
          .from('community_suggestions')
          .update({ votes: newVoteCount })
          .eq('id', suggestionId)

        if (updateError) {
          console.error('Error updating suggestion votes:', updateError)
        }

        return {
          success: true,
          action: 'removed',
          vote_type: voteType
        }
      } else {
        // Change vote type
        const { error: updateError } = await supabase
          .from('community_suggestion_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)

        if (updateError) {
          console.error('Error updating vote:', updateError)
          return {
            success: false,
            error: 'Failed to update vote'
          }
        }

        // Update suggestion vote count (change from old vote to new vote)
        const voteChange = existingVote.vote_type === 'upvote' ? -2 : 2
        const { data: currentSuggestion } = await supabase
          .from('community_suggestions')
          .select('votes')
          .eq('id', suggestionId)
          .single()
        
        const newVoteCount = (currentSuggestion?.votes || 0) + voteChange
        const { error: suggestionUpdateError } = await supabase
          .from('community_suggestions')
          .update({ votes: newVoteCount })
          .eq('id', suggestionId)

        if (suggestionUpdateError) {
          console.error('Error updating suggestion votes:', suggestionUpdateError)
        }

        return {
          success: true,
          action: 'changed',
          vote_type: voteType
        }
      }
    } else {
      // Add new vote
      const { error: insertError } = await supabase
        .from('community_suggestion_votes')
        .insert({
          suggestion_id: suggestionId,
          user_id: user.id,
          vote_type: voteType
        })

      if (insertError) {
        console.error('Error inserting vote:', insertError)
        return {
          success: false,
          error: 'Failed to submit vote'
        }
      }

      // Update suggestion vote count
      const voteChange = voteType === 'upvote' ? 1 : -1
      const { data: currentSuggestion } = await supabase
        .from('community_suggestions')
        .select('votes')
        .eq('id', suggestionId)
        .single()
      
      const newVoteCount = (currentSuggestion?.votes || 0) + voteChange
      const { error: updateError } = await supabase
        .from('community_suggestions')
        .update({ votes: newVoteCount })
        .eq('id', suggestionId)

      if (updateError) {
        console.error('Error updating suggestion votes:', updateError)
      }

      return {
        success: true,
        action: 'added',
        vote_type: voteType
      }
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
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return null
    }

    // Get user's vote from community_suggestion_votes table
    const { data: vote, error } = await supabase
      .from('community_suggestion_votes')
      .select('vote_type')
      .eq('suggestion_id', suggestionId)
      .eq('user_id', user.id)
      .single()

    if (error || !vote) {
      return null
    }

    return vote.vote_type as 'upvote' | 'downvote'
  } catch (error) {
    console.error('Error getting user vote:', error)
    return null
  }
}
