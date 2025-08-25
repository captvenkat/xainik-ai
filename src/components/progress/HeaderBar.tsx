'use client'

import { useState, useEffect } from 'react'
import { Share, Calendar, ChevronDown } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { trackDateRangeChanged, trackPitchChanged, trackShareModalOpened } from '@/lib/metrics/track'
import type { Range } from '@/lib/actions/progress'

interface HeaderBarProps {
  userId: string
  dateRange: Range
  onDateRangeChange: (range: Range) => void
  selectedPitchId: string | null
  onPitchChange: (pitchId: string | null) => void
}

export default function HeaderBar({ 
  userId, 
  dateRange, 
  onDateRangeChange, 
  selectedPitchId, 
  onPitchChange 
}: HeaderBarProps) {
  const [pitches, setPitches] = useState<any[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPitches()
  }, [userId])

  async function loadPitches() {
    try {
      setLoading(true)
      const supabase = createSupabaseBrowser()
      
      const { data: pitchesData } = await supabase
        .from('pitches')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setPitches(pitchesData || [])
      
      // Auto-select first pitch if none selected
      if (!selectedPitchId && pitchesData && pitchesData.length > 0) {
        onPitchChange(pitchesData[0]?.id || '')
      }
    } catch (error) {
      console.error('Failed to load pitches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (range: Range) => {
    onDateRangeChange(range)
    trackDateRangeChanged(userId, range, selectedPitchId || undefined)
  }

  const handlePitchChange = (pitchId: string) => {
    onPitchChange(pitchId)
    trackPitchChanged(userId, pitchId)
  }

  const handleShareClick = () => {
    setShowShareModal(true)
    trackShareModalOpened(userId, selectedPitchId || undefined)
  }

  const dateRangeOptions: { value: Range; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '14d', label: '14 days' },
    { value: '30d', label: '30 days' },
    { value: '60d', label: '60 days' },
    { value: '90d', label: '90 days' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Pitch selector and date range */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Pitch Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Pitch:</label>
            <select
              value={selectedPitchId || ''}
              onChange={(e) => handlePitchChange(e.target.value)}
              disabled={loading}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {pitches.map((pitch) => (
                <option key={pitch.id} value={pitch.id}>
                  {pitch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value as Range)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side - Smart Share Hub */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShareClick}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Share className="w-4 h-4" />
            Smart Share Hub
          </button>
        </div>
      </div>

      {/* Share Modal would be rendered here */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Share Your Pitch</h3>
            <p className="text-gray-600 mb-4">
              Share your pitch across multiple platforms to maximize your reach.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
