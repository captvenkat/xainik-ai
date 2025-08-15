'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown, X } from 'lucide-react'

interface LocationOption {
  place_id: string
  description: string
  city: string
}

interface LocationAutocompleteProps {
  value: string
  onChange: (location: string) => void
  placeholder?: string
  className?: string
}

export default function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter your location...",
  className = ""
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Google Places API key - you'll need to add this to your environment variables
  const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const extractCityFromDescription = (description: string): string => {
    // Extract city from Google Places description
    // Format is usually: "City, State, Country" or "City, Country"
    const parts = description.split(', ')
    if (parts.length >= 2) {
      // Return the first part (city) and second part (state/country)
      return `${parts[0]}, ${parts[1]}`
    }
    return parts[0] || description
  }

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('Google Places API key not found')
      // Fallback to basic Indian city suggestions
      setSuggestions([
        { place_id: '1', description: 'Mumbai, Maharashtra, India', city: 'Mumbai, Maharashtra' },
        { place_id: '2', description: 'Delhi, Delhi, India', city: 'Delhi, Delhi' },
        { place_id: '3', description: 'Bangalore, Karnataka, India', city: 'Bangalore, Karnataka' },
        { place_id: '4', description: 'Hyderabad, Telangana, India', city: 'Hyderabad, Telangana' },
        { place_id: '5', description: 'Chennai, Tamil Nadu, India', city: 'Chennai, Tamil Nadu' },
        { place_id: '6', description: 'Kolkata, West Bengal, India', city: 'Kolkata, West Bengal' },
        { place_id: '7', description: 'Pune, Maharashtra, India', city: 'Pune, Maharashtra' },
        { place_id: '8', description: 'Ahmedabad, Gujarat, India', city: 'Ahmedabad, Gujarat' }
      ])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&components=country:in&key=${GOOGLE_PLACES_API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }

      const data = await response.json()
      
      if (data.predictions) {
        const options: LocationOption[] = data.predictions.slice(0, 5).map((prediction: any) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          city: extractCityFromDescription(prediction.description)
        }))
        setSuggestions(options)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    
    if (newValue.trim()) {
      setIsOpen(true)
      searchLocations(newValue)
    } else {
      setIsOpen(false)
      setSuggestions([])
    }
  }

  const handleSelectLocation = (option: LocationOption) => {
    setInputValue(option.city)
    onChange(option.city)
    setIsOpen(false)
    setSuggestions([])
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setIsOpen(false)
    setSuggestions([])
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {inputValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Loading locations...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((option) => (
                <li key={option.place_id}>
                  <button
                    onClick={() => handleSelectLocation(option)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{option.city}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : inputValue.trim() && !isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No locations found
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
