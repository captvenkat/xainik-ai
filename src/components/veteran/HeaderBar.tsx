'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Share2, 
  Copy, 
  Edit, 
  ChevronDown,
  Globe,
  MessageCircle,
  Phone,
  Mail,
  Twitter
} from 'lucide-react'

interface Pitch {
  id: string
  title: string
  is_active: boolean
}

interface HeaderBarProps {
  pitches: Pitch[]
  selectedPitchId: string
  onPitchChange: (pitchId: string) => void
  dateRange: '7d' | '30d' | '90d'
  onDateRangeChange: (range: '7d' | '30d' | '90d') => void
  onSharePitch: () => void
  onEditPitch: () => void
}

export default function HeaderBar({
  pitches,
  selectedPitchId,
  onPitchChange,
  dateRange,
  onDateRangeChange,
  onSharePitch,
  onEditPitch
}: HeaderBarProps) {
  const [showPitchDropdown, setShowPitchDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const selectedPitch = pitches.find(p => p.id === selectedPitchId)
  const activePitches = pitches.filter(p => p.is_active)

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ]

  const shareOptions = [
    { label: 'Copy Link', icon: Copy, action: 'copy' },
    { label: 'Share on WhatsApp', icon: MessageCircle, action: 'whatsapp' },
    { label: 'Share on LinkedIn', icon: Globe, action: 'linkedin' },
    { label: 'Share on Facebook', icon: Globe, action: 'facebook' },
    { label: 'Share via Email', icon: Mail, action: 'email' },
    { label: 'Share on Twitter', icon: Twitter, action: 'twitter' }
  ]

  const handleShareAction = (action: string) => {
    setShowShareMenu(false)
    
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(`${window.location.origin}/pitch/${selectedPitchId}`)
        // You could add a toast notification here
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=Check out this veteran's pitch: ${window.location.origin}/pitch/${selectedPitchId}`)
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/pitch/${selectedPitchId}`)}`)
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/pitch/${selectedPitchId}`)}`)
        break
      case 'email':
        window.open(`mailto:?subject=Veteran Pitch&body=Check out this veteran's pitch: ${window.location.origin}/pitch/${selectedPitchId}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=Check out this veteran's pitch&url=${encodeURIComponent(`${window.location.origin}/pitch/${selectedPitchId}`)}`)
        break
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Left side - Pitch selector and date range */}
        <div className="flex items-center gap-4">
          {/* Pitch Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPitchDropdown(!showPitchDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors min-w-[200px]"
            >
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">
                  {selectedPitch?.title || 'Select Pitch'}
                </div>
                <div className="text-xs text-gray-500">
                  {activePitches.length} active pitch{activePitches.length !== 1 ? 'es' : ''}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showPitchDropdown && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">Select a pitch</div>
                  <div className="text-xs text-gray-500">Choose which pitch to analyze</div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {activePitches.map((pitch) => (
                    <button
                      key={pitch.id}
                      onClick={() => {
                        onPitchChange(pitch.id)
                        setShowPitchDropdown(false)
                      }}
                      className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                        pitch.id === selectedPitchId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{pitch.title}</div>
                      <div className="text-xs text-gray-500">
                        {pitch.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowPitchDropdown(false)
                      onEditPitch()
                    }}
                    className="w-full py-2 px-3 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Pitch
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {dateRangeOptions.find(opt => opt.value === dateRange)?.label}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDateDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onDateRangeChange(option.value as '7d' | '30d' | '90d')
                      setShowDateDropdown(false)
                    }}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                      option.value === dateRange ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            {showShareMenu && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">Share your pitch</div>
                  <div className="text-xs text-gray-500">Choose how to share</div>
                </div>
                <div className="p-2">
                  {shareOptions.map((option) => (
                    <button
                      key={option.action}
                      onClick={() => handleShareAction(option.action)}
                      className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <option.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            onClick={onEditPitch}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
        <span>Dashboard</span>
        <span>•</span>
        <span>Analytics</span>
        {selectedPitch && (
          <>
            <span>•</span>
            <span className="text-gray-900 font-medium">{selectedPitch.title}</span>
          </>
        )}
      </div>
    </div>
  )
}
