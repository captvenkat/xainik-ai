'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Lightbulb, Plus, ThumbsUp, CheckCircle, XCircle, Clock } from 'lucide-react'

// =====================================================
// MINIMALISTIC COMMUNITY SUGGESTIONS COMPONENT
// Professional, Simple, Append-Only to Existing System
// =====================================================

interface CommunitySuggestion {
  id: string
  user_id: string
  suggestion: string
  suggestion_type: 'feature' | 'improvement' | 'bug'
  status: 'active' | 'implemented' | 'rejected'
  votes: number
  created_at: string
  user_name?: string
}

interface CommunitySuggestionsSummary {
  total_suggestions: number
  active_suggestions: number
  implemented_suggestions: number
  rejected_suggestions: number
  avg_votes: number
  unique_suggesters: number
}

export default function CommunitySuggestions({ userId }: { userId: string }) {
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>([])
  const [summary, setSummary] = useState<CommunitySuggestionsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newSuggestion, setNewSuggestion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'feature' | 'improvement' | 'bug'>('improvement')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    fetchSuggestions()
    fetchSummary()
  }, [])

  async function fetchSuggestions() {
    try {
      const { data, error } = await supabase
        .from('community_suggestions')
        .select(`
          *,
          users:user_id(name)
        `)
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      const suggestionsWithNames = data?.map(suggestion => ({
        ...suggestion,
        suggestion: suggestion.title || suggestion.description || 'No description',
        user_name: suggestion.users?.name || 'Anonymous'
      })) || []

      setSuggestions(suggestionsWithNames)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchSummary() {
    try {
      const { data, error } = await supabase
        .from('community_suggestions_summary')
        .select('*')
        .single()

      if (error) throw error
      setSummary(data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  async function submitSuggestion() {
    if (!newSuggestion.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('community_suggestions')
        .insert({
          user_id: userId,
          title: newSuggestion.trim(),
          description: newSuggestion.trim(),
          suggestion_type: selectedCategory,
          priority: 'medium',
          status: 'active',
          votes: 0
        })

      if (error) throw error

      // Reset form and refresh
      setNewSuggestion('')
      setSelectedCategory('improvement')
      setShowForm(false)
      await fetchSuggestions()
      await fetchSummary()

      // Show success feedback
      alert('Thank you! Your suggestion has been submitted.')
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      alert('Error submitting suggestion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function voteOnSuggestion(suggestionId: string, voteType: 'upvote' | 'downvote') {
    try {
      const { error } = await supabase.rpc('vote_on_suggestion', {
        p_suggestion_id: suggestionId,
        p_vote_type: voteType
      })

      if (error) throw error

      // Refresh suggestions to show updated votes
      await fetchSuggestions()
    } catch (error) {
      console.error('Error voting on suggestion:', error)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'implemented':
        return 'Implemented'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Under Review'
    }
  }

  function getCategoryColor(suggestionType: string) {
    switch (suggestionType) {
      case 'feature':
        return 'bg-blue-100 text-blue-800'
      case 'improvement':
        return 'bg-green-100 text-green-800'
      case 'bug':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community suggestions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Community Suggestions</h3>
              <p className="text-gray-600">Help improve Xainik by sharing your ideas</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Suggestion
          </button>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.total_suggestions}</div>
              <div className="text-sm text-gray-600">Total Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.active_suggestions}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.implemented_suggestions}</div>
              <div className="text-sm text-gray-600">Implemented</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{summary.unique_suggesters}</div>
              <div className="text-sm text-gray-600">Contributors</div>
            </div>
          </div>
        )}
      </div>

      {/* New Suggestion Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Suggestion</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="improvement">Improvement</option>
                <option value="feature">New Feature</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Suggestion
              </label>
              <textarea
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder="Describe your idea for improving Xainik..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitSuggestion}
                disabled={isSubmitting || !newSuggestion.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Community Suggestions</h4>
        
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No suggestions yet. Be the first to share an idea!</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(suggestion.suggestion_type)}`}>
                    {suggestion.suggestion_type.charAt(0).toUpperCase() + suggestion.suggestion_type.slice(1)}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {getStatusIcon(suggestion.status)}
                    <span>{getStatusText(suggestion.status)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(suggestion.created_at).toLocaleDateString()}
                </div>
              </div>

              <p className="text-gray-900 mb-4">{suggestion.suggestion}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => voteOnSuggestion(suggestion.id, 'upvote')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">{suggestion.votes}</span>
                  </button>
                  <span className="text-sm text-gray-500">
                    by {suggestion.user_name}
                  </span>
                </div>

                {suggestion.status === 'implemented' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Implemented!</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
