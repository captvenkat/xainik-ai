'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import PitchCard from './PitchCard'
import type { PitchCardData } from '@/types/domain'
import { toPitchCardData, type RawPitchRow } from '@/lib/mappers/pitches'

export default function FeaturedPitches() {
  const [pitches, setPitches] = useState<PitchCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPitches = async () => {
      try {
        const supabase = createSupabaseBrowser()
        
        // Get pitches from last 7 days, ordered by likes
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const { data, error } = await supabase
          .from('pitches')
          .select(`
            id,
            title,
            summary,
            skills,
            city,
            job_type,
            availability,
            likes,
            veteran_id,
            veteran:profiles!pitches_veteran_id_fkey (
              id,
              full_name,
              rank,
              service_branch,
              years_experience,
              photo_url,
              is_community_verified
            )
          `)
          .eq('is_active', true)
          .gt('plan_expires_at', new Date().toISOString())
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('likes', { ascending: false })
          .limit(4);

        if (error) throw error;
        const rows = data || [];

        const cards: PitchCardData[] = rows.map((r: any) => toPitchCardData(r as RawPitchRow));
        setPitches(cards);
      } catch (error) {
        console.error('Error fetching featured pitches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedPitches()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (pitches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Pitches Yet</h3>
          <p className="text-gray-600">
            Be the first to create a pitch and get featured here!
          </p>
        </div>
        <a
          href="/pitch/new"
          className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Create Your Pitch
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Veterans</h2>
        <p className="text-gray-600">
          Most liked pitches from the last 7 days
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pitches.map((pitch) => (
          <PitchCard
            key={pitch.id}
            data={pitch}
            variant="featured"
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <a
          href="/browse"
          className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          View All Veterans
        </a>
      </div>
    </div>
  )
}
