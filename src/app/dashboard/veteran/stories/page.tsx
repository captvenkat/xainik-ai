'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { useAuth } from '@/lib/hooks/useAuth'
import AppContainer from '@/components/AppContainer'
import BottomNav from '@/components/BottomNav'
import StorySuggestions from '@/components/veteran/StorySuggestions'
import StoryCard from '@/components/veteran/StoryCard'
import StoryModal from '@/components/veteran/StoryModal'
import { Plus, RefreshCw } from 'lucide-react'
import type { StoryCandidate, StoryPublic } from '../../../../types/xainik'

export default function VeteranStoriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stories, setStories] = useState<StoryPublic[]>([])
  const [suggestions, setSuggestions] = useState<StoryCandidate[]>([])
  const [selectedStory, setSelectedStory] = useState<StoryPublic | StoryCandidate | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadStories()
      loadSuggestions()
    }
  }, [user])

  const loadStories = async () => {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get user's pitch
      const { data: pitches } = await supabase
        .from('pitches')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1)

      if (pitches && pitches.length > 0 && pitches[0]?.id) {
        const response = await fetch(`/api/xainik/stories/${pitches[0].id}/by-pitch`)
        if (response.ok) {
          const data = await response.json()
          setStories(data.published || [])
        }
      }
    } catch (error) {
      console.error('Error loading stories:', error)
      setError('Failed to load stories')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      const supabase = createSupabaseBrowser()
      
      // Get user's pitch with objective, preferences, and extracted text
      const { data: pitches } = await supabase
        .from('pitches')
        .select('id, objective, preferences, resume_url')
        .eq('user_id', user?.id)
        .limit(1)

      if (pitches && pitches.length > 0 && pitches[0]?.objective) {
        // Get used facets from published and queued stories
        const { data: existingStories } = await supabase
          .from('stories')
          .select('coverage_facets')
          .eq('pitch_id', pitches[0].id)
          .in('status', ['published', 'queued'])

        const usedFacets = new Set<string>()
        existingStories?.forEach(story => {
          if (story.coverage_facets) {
            story.coverage_facets.forEach((facet: string) => usedFacets.add(facet))
          }
        })

        // Mock extracted text (in production, this would come from resume processing)
        const extractedText = 'Experienced military leader with 8+ years of service in the Indian Army. Led teams of 50+ personnel in high-pressure operational environments. Managed logistics, training programs, and strategic planning initiatives.'

        // Build targets from preferences
        const targets = pitches[0].preferences?.targets || []

        const response = await fetch('/api/xainik/ai/suggest-stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objective: pitches[0].objective,
            extracted_text: extractedText,
            targets,
            used_facets: Array.from(usedFacets),
            available_facets: ['leadership', 'logistics', 'training', 'planning', 'operations', 'team_management']
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.explain) {
            setError(data.explain)
          } else {
            setSuggestions(data.stories || [])
          }
        }
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
      setError('Failed to load story suggestions')
    }
  }

  const handleMoreSuggestions = async () => {
    setIsGeneratingSuggestions(true)
    setError('')
    try {
      const supabase = createSupabaseBrowser()
      
      const { data: pitches } = await supabase
        .from('pitches')
        .select('id, objective, preferences')
        .eq('user_id', user?.id)
        .limit(1)

      if (pitches && pitches.length > 0 && pitches[0]?.objective) {
        // Get used facets from published and queued stories
        const { data: existingStories } = await supabase
          .from('stories')
          .select('coverage_facets')
          .eq('pitch_id', pitches[0].id)
          .in('status', ['published', 'queued'])

        const usedFacets = new Set<string>()
        existingStories?.forEach(story => {
          if (story.coverage_facets) {
            story.coverage_facets.forEach((facet: string) => usedFacets.add(facet))
          }
        })

        // Mock extracted text (in production, this would come from resume processing)
        const extractedText = 'Experienced military leader with 8+ years of service in the Indian Army. Led teams of 50+ personnel in high-pressure operational environments. Managed logistics, training programs, and strategic planning initiatives.'

        // Build targets from preferences
        const targets = pitches[0].preferences?.targets || []

        const response = await fetch('/api/xainik/ai/suggest-stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objective: pitches[0].objective,
            extracted_text: extractedText,
            targets,
            used_facets: Array.from(usedFacets),
            available_facets: ['leadership', 'logistics', 'training', 'planning', 'operations', 'team_management'],
            regen_token: Date.now().toString()
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.explain) {
            setError(data.explain)
          } else {
            setSuggestions(data.stories || [])
          }
        }
      }
    } catch (error) {
      console.error('Error generating more suggestions:', error)
      setError('Failed to generate more suggestions')
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const handleUseStory = async (story: StoryCandidate) => {
    try {
      const supabase = createSupabaseBrowser()
      
      const { data: pitches } = await supabase
        .from('pitches')
        .select('id, objective, preferences')
        .eq('user_id', user?.id)
        .limit(1)

      if (pitches && pitches.length > 0 && pitches[0]) {
        const pitch = pitches[0]
        // Mock extracted text (in production, this would come from resume processing)
        const extractedText = 'Experienced military leader with 8+ years of service in the Indian Army. Led teams of 50+ personnel in high-pressure operational environments. Managed logistics, training programs, and strategic planning initiatives.'

        // Build targets from preferences
        const targets = pitch.preferences?.targets || []

        // Generate style seed for variety
        const styleSeed = {
          format: ['prose', 'bullets', 'numbered'][Math.floor(Math.random() * 3)] as 'prose' | 'bullets' | 'numbered',
          tone: ['direct', 'reflective'][Math.floor(Math.random() * 2)] as 'direct' | 'reflective'
        }

        // Expand story
        const response = await fetch('/api/xainik/ai/expand-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: story.title,
            angle: story.angle,
            outline: story.outline,
            objective: pitch.objective,
            targets,
            coverage_facets: story.coverage_facets,
            source_spans: story.source_spans,
            extracted_text: extractedText,
            style_seed: styleSeed
          })
        })

        if (response.ok) {
          const expandedStory = await response.json()
          
          if (expandedStory.explain) {
            setError(expandedStory.explain)
            return
          }
          
          // Create story draft first
          const createResponse = await fetch('/api/xainik/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pitch_id: pitch.id,
              title: story.title,
              summary: story.angle, // Use angle as temporary summary
              body_md: '', // Will be filled after expansion
              source_spans: story.source_spans,
              coverage_facets: story.coverage_facets
            })
          })

          if (createResponse.ok) {
            const { id: storyId } = await createResponse.json()
            
            // Update with expanded content
            const updateResponse = await fetch(`/api/xainik/stories/${storyId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                summary: expandedStory.summary,
                body_md: expandedStory.body_md,
                style_seed: styleSeed
              })
            })

            if (updateResponse.ok) {
              // Fetch the complete story for the modal
              const storyResponse = await fetch(`/api/xainik/stories/${storyId}`)
              if (storyResponse.ok) {
                const { story: newStory } = await storyResponse.json()
                setSelectedStory(newStory)
                setShowModal(true)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error using story:', error)
      setError('Failed to create story')
    }
  }

  const handleEditStory = (story: StoryCandidate) => {
    setSelectedStory(story)
    setShowModal(true)
  }

  const handleViewStory = (story: StoryPublic) => {
    setSelectedStory(story)
    setShowModal(true)
  }

  const handleShareStory = (story: StoryPublic) => {
    // Implement share functionality
    console.log('Share story:', story)
  }

  const handlePublishStory = async () => {
    if (!selectedStory || 'id' in selectedStory === false) return

    try {
      const response = await fetch(`/api/xainik/stories/${selectedStory.id}/publish`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.status === 'published') {
          setShowModal(false)
          loadStories() // Refresh stories
        } else {
          // Story was queued
          if (selectedStory && 'id' in selectedStory) {
            setSelectedStory({ ...selectedStory, status: 'queued' } as any)
          }
        }
      }
    } catch (error) {
      console.error('Error publishing story:', error)
      setError('Failed to publish story')
    }
  }

  if (isLoading) {
    return (
      <AppContainer>
        <div className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your stories...</p>
          </div>
        </div>
        <BottomNav />
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <div className="py-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Stories</h1>
            <p className="text-gray-600">Share your military experience through compelling stories</p>
          </div>
          <button
            onClick={() => router.push('/pitch/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Story
          </button>
        </div>

        {/* Published Stories */}
        {stories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Published Stories</h2>
            <div className="grid gap-4">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onView={handleViewStory}
                  onShare={handleShareStory}
                />
              ))}
            </div>
          </div>
        )}

        {/* Story Suggestions */}
        <div className="mb-8">
          <StorySuggestions
            suggestions={suggestions}
            onUseStory={handleUseStory}
            onMoreSuggestions={handleMoreSuggestions}
            onEditStory={handleEditStory}
            isLoading={false}
            isGeneratingMore={isGeneratingSuggestions}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => {
                setError('')
                loadSuggestions()
              }}
              className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {stories.length === 0 && suggestions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first story to showcase your military experience
            </p>
            <button
              onClick={() => router.push('/pitch/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Story
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Story Modal */}
      {selectedStory && (
        <StoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          story={selectedStory}
          onPublish={handlePublishStory}
          onEdit={() => console.log('Edit story')}
          onShare={() => console.log('Share story')}
          isPublishing={false}
          isPublished={'published_at' in selectedStory}
          publishMessage={'status' in selectedStory && selectedStory.status === 'queued' ? 'Story queued for tomorrow' : undefined}
        />
      )}

      <BottomNav />
    </AppContainer>
  )
}
