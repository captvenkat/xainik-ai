'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

interface ChipGroupProps {
  title: string
  chips: string[]
  selectedChips: string[]
  onChipToggle: (chip: string) => void
  onCustomChip: (chip: string) => void
  maxSelection?: number
  allowCustom?: boolean
  isLoading?: boolean
}

export default function ChipGroup({
  title,
  chips,
  selectedChips,
  onChipToggle,
  onCustomChip,
  maxSelection = 3,
  allowCustom = true,
  isLoading = false
}: ChipGroupProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customChip, setCustomChip] = useState('')

  const handleChipToggle = (chip: string) => {
    if (selectedChips.includes(chip)) {
      onChipToggle(chip)
    } else if (selectedChips.length < maxSelection) {
      onChipToggle(chip)
    }
  }

  const handleCustomSubmit = () => {
    if (customChip.trim() && selectedChips.length < maxSelection) {
      onCustomChip(customChip.trim())
      setCustomChip('')
      setShowCustomInput(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex flex-wrap gap-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded-full animate-pulse"
              style={{ width: `${Math.random() * 100 + 60}px` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">
          {selectedChips.length}/{maxSelection}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {chips.map((chip) => {
          const isSelected = selectedChips.includes(chip)
          const isDisabled = !isSelected && selectedChips.length >= maxSelection
          
          return (
            <button
              key={chip}
              onClick={() => handleChipToggle(chip)}
              disabled={isDisabled}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {chip}
            </button>
          )
        })}
        
        {allowCustom && selectedChips.length < maxSelection && (
          <button
            onClick={() => setShowCustomInput(true)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Custom
          </button>
        )}
      </div>

      {showCustomInput && (
        <div className="space-y-3">
          <input
            type="text"
            value={customChip}
            onChange={(e) => setCustomChip(e.target.value)}
            placeholder={`Enter custom ${title.toLowerCase()}...`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={50}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCustomSubmit}
              disabled={!customChip.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false)
                setCustomChip('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
