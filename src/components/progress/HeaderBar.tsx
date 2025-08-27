'use client'

import { useState, useEffect } from 'react'
import { Share, Calendar, ChevronDown } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { trackDateRangeChanged, trackPitchChanged, trackShareModalOpened } from '@/lib/metrics/track'
import type { Range } from '@/lib/actions/progress'
import SimpleShareModal from '@/components/SimpleShareModal'

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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            title="Share your pitch across multiple platforms with AI-powered templates"
          >
            <Share className="w-4 h-4" />
            Smart Share Hub
          </button>
        </div>
      </div>

      {/* Simple Share Modal */}
      <SimpleShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        pitchId={selectedPitchId || ''}
        pitchTitle="Your Pitch"
        veteranName="Veteran"
        userId={userId}
      />
    </div>
  )
}
