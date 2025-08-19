'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { GooglePlace, LocationAutocompleteResult } from '../../types/enhanced-profile';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: LocationAutocompleteResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search for a location...",
  className = "",
  disabled = false,
  error
}: LocationAutocompleteProps) {
  const [predictions, setPredictions] = useState<GooglePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Google Places API key - should be in environment variables
  const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    // Load Google Places API script
    const loadGooglePlacesScript = () => {
      if (window.google && window.google.maps) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Places API'));
        document.head.appendChild(script);
      });
    };

    loadGooglePlacesScript().catch(console.error);
  }, [GOOGLE_PLACES_API_KEY]);

  const searchPlaces = async (input: string) => {
    if (!input.trim() || !GOOGLE_PLACES_API_KEY) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${GOOGLE_PLACES_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();
      
      if (data.status === 'OK') {
        setPredictions(data.predictions || []);
      } else {
        console.warn('Google Places API error:', data.status);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the API call
    timeoutRef.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);
  };

  const handleLocationSelect = (place: GooglePlace) => {
    const location: LocationAutocompleteResult = {
      place_id: place.place_id,
      city: place.structured_formatting.main_text,
      country: place.structured_formatting.secondary_text,
      full_address: place.description,
      display_text: `${place.structured_formatting.main_text}, ${place.structured_formatting.secondary_text}`
    };

    onChange(location.display_text);
    onLocationSelect?.(location);
    setShowDropdown(false);
    setPredictions([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handleLocationSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (predictions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const clearInput = () => {
    onChange('');
    setPredictions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
        />
        
        {value && !disabled && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {predictions.map((place, index) => (
            <button
              key={place.place_id}
              type="button"
              onClick={() => handleLocationSelect(place)}
              className={`
                w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                ${selectedIndex === index ? 'bg-gray-50' : ''}
              `}
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    {place.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500">
                    {place.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && predictions.length === 0 && value.trim() && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-4 py-2 text-sm text-gray-500">
            No locations found
          </div>
        </div>
      )}
    </div>
  );
}
