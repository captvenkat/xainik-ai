'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

interface GooglePlace {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

declare global {
  interface Window {
    google: any
  }
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Enter location...",
  className = "",
  disabled = false
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GooglePlace[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)

  // Initialize Google Places API
  useEffect(() => {
    const initGooglePlaces = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService()
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        )
      }
    }

    // Load Google Places API script
    const loadGooglePlacesScript = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = initGooglePlaces
        document.head.appendChild(script)
      } else {
        initGooglePlaces()
      }
    }

    loadGooglePlacesScript()
  }, [])

  const getPlaceSuggestions = async (input: string) => {
    if (!autocompleteService.current || !input.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const request = {
        input: input,
        types: ['(cities)'], // Restrict to cities
        componentRestrictions: { country: 'in' } // Restrict to India
      }

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions: GooglePlace[], status: string) => {
          setIsLoading(false)
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions)
            setShowSuggestions(true)
          } else {
            setSuggestions([])
            setShowSuggestions(false)
          }
        }
      )
    } catch (error) {
      console.error('Error fetching place suggestions:', error)
      setIsLoading(false)
      setSuggestions([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    if (newValue.length >= 2) {
      getPlaceSuggestions(newValue)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: GooglePlace) => {
    onChange(suggestion.description)
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className} ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <div className="font-medium text-gray-900">
                {suggestion.structured_formatting.main_text}
              </div>
              <div className="text-sm text-gray-500">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No suggestions message */}
      {showSuggestions && suggestions.length === 0 && value.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-2 text-gray-500 text-sm">
            No cities found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  )
}
