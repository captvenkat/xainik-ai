'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'

interface FiltersProps {
  searchParams: {
    q?: string
    skills?: string
    city?: string
    availability?: string
    jobType?: string
    branch?: string
  }
}

const AVAILABILITY_OPTIONS = [
  'Immediate',
  '30 days',
  '60 days',
  '90 days'
]

const JOB_TYPE_OPTIONS = [
  'full-time',
  'part-time',
  'freelance',
  'consulting',
  'hybrid',
  'project-based',
  'remote',
  'on-site'
]

const SERVICE_BRANCH_OPTIONS = [
  'Army',
  'Navy',
  'Air Force',
  'Marines',
  'Coast Guard'
]

const COMMON_SKILLS = [
  'Leadership',
  'Project Management',
  'Strategic Planning',
  'Team Management',
  'Communication',
  'Problem Solving',
  'Risk Management',
  'Operations',
  'Logistics',
  'Training',
  'Security',
  'Technology',
  'Data Analysis',
  'Customer Service',
  'Sales'
]

export default function Filters({ searchParams }: FiltersProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    q: searchParams.q || '',
    skills: searchParams.skills || '',
    city: searchParams.city || '',
    availability: searchParams.availability || '',
    jobType: searchParams.jobType || '',
    branch: searchParams.branch || ''
  })

  const updateFilters = (updates: Partial<typeof localFilters>) => {
    const newFilters = { ...localFilters, ...updates }
    setLocalFilters(newFilters)
    
    const params = new URLSearchParams(urlSearchParams.toString())
    
    // Update or remove parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value.trim())
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`/browse?${params.toString()}`)
  }

  const clearFilters = () => {
    setLocalFilters({
      q: '',
      skills: '',
      city: '',
      availability: '',
      jobType: '',
      branch: ''
    })
    router.push('/browse')
  }

  const hasActiveFilters = Object.values(localFilters).some(value => value && value.trim())

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search veterans by name, title, or skills..."
          value={localFilters.q}
          onChange={(e) => updateFilters({ q: e.target.value })}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {Object.values(localFilters).filter(v => v && v.trim()).length}
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <input
              type="text"
              placeholder="e.g., Leadership, Project Management"
              value={localFilters.skills}
              onChange={(e) => updateFilters({ skills: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {COMMON_SKILLS.slice(0, 5).map(skill => (
                <button
                  key={skill}
                  onClick={() => {
                    const currentSkills = localFilters.skills.split(',').map(s => s.trim()).filter(Boolean)
                    const newSkills = currentSkills.includes(skill) 
                      ? currentSkills.filter(s => s !== skill)
                      : [...currentSkills, skill]
                    updateFilters({ skills: newSkills.join(', ') })
                  }}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    localFilters.skills.includes(skill)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              placeholder="e.g., Delhi, Mumbai"
              value={localFilters.city}
              onChange={(e) => updateFilters({ city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={localFilters.availability}
              onChange={(e) => updateFilters({ availability: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any availability</option>
              {AVAILABILITY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              value={localFilters.jobType}
              onChange={(e) => updateFilters({ jobType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any job type</option>
              {JOB_TYPE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Service Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Branch
            </label>
            <div className="space-y-2">
              {SERVICE_BRANCH_OPTIONS.map(branch => (
                <label key={branch} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.branch.includes(branch)}
                    onChange={(e) => {
                      const currentBranches = localFilters.branch.split(',').map(b => b.trim()).filter(Boolean)
                      const newBranches = e.target.checked
                        ? [...currentBranches, branch]
                        : currentBranches.filter(b => b !== branch)
                      updateFilters({ branch: newBranches.join(', ') })
                    }}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{branch}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          {Object.entries(localFilters).map(([key, value]) => {
            if (!value || !value.trim()) return null
            
            const displayValue = key === 'jobType' 
              ? value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')
              : value
            
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                <span className="font-medium">{key}:</span>
                <span>{displayValue}</span>
                <button
                  onClick={() => updateFilters({ [key]: '' })}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
