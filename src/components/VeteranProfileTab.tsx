'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { useAuth } from '@/lib/hooks/useAuth'
import { User, Mail, Phone, Calendar, Save, Edit3, CheckCircle, AlertCircle, ArrowLeft, MapPin, Star, Link as LinkIcon, FileText, Shield, Clock, Award } from 'lucide-react'
import Link from 'next/link'
import LocationAutocomplete from './LocationAutocomplete'
import WebLinksEditor from './WebLinksEditor'
import { 
  ProfileFormData, 
  validateProfileForm, 
  ALL_MILITARY_RANKS,
  SERVICE_BRANCHES,
  getDefaultProfileFormData,
  parseLocationString,
  calculateRetirementStatus,
  formatRetirementDisplay
} from '@/types/enhanced-profile'

export default function VeteranProfileTab() {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState<ProfileFormData>(getDefaultProfileFormData())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [veteranProfile, setVeteranProfile] = useState<any>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<ProfileFormData | null>(null)

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return

      try {
        const supabase = createSupabaseBrowser()
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        // Get veteran profile
        const { data: veteranData } = await supabase
          .from('veterans')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        setVeteranProfile(veteranData)
        
        // Initialize enhanced form data
        setFormData({
          name: profileData?.name || '',
          phone: profileData?.phone || '',
          military_rank: veteranData?.military_rank || '',
          service_branch: veteranData?.service_branch || '',
          years_experience: veteranData?.years_experience?.toString() || '',
          bio: veteranData?.bio || '',
          location_current: veteranData?.location_current || '',
          locations_preferred: veteranData?.locations_preferred || [],
          web_links: (veteranData?.web_links as any) || [],
          retirement_date: veteranData?.retirement_date || ''
        })
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }

    loadProfileData()
  }, [user])

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleLocationAdd = () => {
    if (formData.locations_preferred.length < 3) {
      setFormData(prev => ({
        ...prev,
        locations_preferred: [...prev.locations_preferred, '']
      }))
    }
  }

  const handleLocationRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations_preferred: prev.locations_preferred.filter((_, i) => i !== index)
    }))
  }

  const handleLocationChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      locations_preferred: prev.locations_preferred.map((loc, i) => 
        i === index ? value : loc
      )
    }))
  }

  const saveProfile = async (data: ProfileFormData, showSuccess = true) => {
    if (!user) return false

    try {
      // Validate form
      const validationResult = validateProfileForm(data)
      if (!validationResult.isValid) {
        setErrors(validationResult.errors)
        return false
      }

      const supabase = createSupabaseBrowser()
      
      // Parse locations for structured storage
      const locationCurrentParsed = parseLocationString(data.location_current)
      const locationsPreferredParsed = data.locations_preferred
        .filter(loc => loc.trim())
        .map(loc => parseLocationString(loc))

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: data.name,
          phone: data.phone
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Update or create veteran profile
      const veteranData = {
        user_id: user.id,
        rank: data.military_rank, // Map military_rank to rank field
        military_rank: data.military_rank,
        service_branch: data.service_branch,
        years_experience: data.years_experience ? parseInt(data.years_experience) : 0,
        bio: data.bio,
        location_current: data.location_current,
        location_current_city: locationCurrentParsed.city,
        location_current_country: locationCurrentParsed.country,
        locations_preferred: data.locations_preferred.filter(loc => loc.trim()),
        locations_preferred_structured: locationsPreferredParsed as any,
        web_links: data.web_links as any,
        retirement_date: data.retirement_date || null
      }

      // Always use upsert to handle both create and update cases
      const { error: veteranError } = await supabase
        .from('veterans')
        .upsert(veteranData, {
          onConflict: 'user_id'
        })

      if (veteranError) throw veteranError

      if (showSuccess) {
        setSuccess('Profile updated successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      }
      
      setLastSaved(new Date())
      lastSavedDataRef.current = { ...data }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return false
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')
    setErrors({})

    const success = await saveProfile(formData, true)
    if (success) {
      setIsEditing(false)
    }
    setIsLoading(false)
  }

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save (3 seconds after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Only auto-save if data has actually changed and we're not already saving
      if (isAutoSaving || (lastSavedDataRef.current && JSON.stringify(lastSavedDataRef.current) === JSON.stringify(formData))) {
        return
      }

      setIsAutoSaving(true)
      setError('')
      
      await saveProfile(formData, false)
      setIsAutoSaving(false)
    }, 3000)
  }, [formData, isAutoSaving])

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (isEditing && user) {
      triggerAutoSave()
    }
  }, [formData, isEditing, user, triggerAutoSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  const getMilitaryRanksForBranch = (branch: string) => {
    if (!branch || !ALL_MILITARY_RANKS[branch as keyof typeof ALL_MILITARY_RANKS]) {
      return { OFFICERS: [], JCOs: [], NCOs: [], AGNIVEERS: [] };
    }
    
    return ALL_MILITARY_RANKS[branch as keyof typeof ALL_MILITARY_RANKS];
  }

  if (!user) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Enhanced Profile</h2>
              <p className="text-sm text-gray-600">Manage your military service and personal information</p>
              {isEditing && (
                <div className="flex items-center gap-2 mt-1">
                  {isAutoSaving ? (
                    <div className="flex items-center text-xs text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                      Auto-saving...
                    </div>
                  ) : lastSaved ? (
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      Changes will be saved automatically
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="px-6 py-3 bg-green-50 border-b border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="p-6">
        {isEditing ? (
          /* Enhanced Edit Form */
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.phone 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="+91XXXXXXXXXX"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Bio
              </h3>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about yourself
                </label>
                <div className="relative">
                  <textarea
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.bio 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Share your story, achievements, or what you're looking for..."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                    {formData.bio.length}/600
                  </div>
                </div>
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                )}
              </div>
            </div>

            {/* Military Service */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Military Service
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="service_branch" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Branch
                  </label>
                  <select
                    id="service_branch"
                    value={formData.service_branch}
                    onChange={(e) => handleInputChange('service_branch', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.service_branch 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Branch</option>
                    {SERVICE_BRANCHES.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  {errors.service_branch && (
                    <p className="mt-1 text-sm text-red-600">{errors.service_branch}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="military_rank" className="block text-sm font-medium text-gray-700 mb-2">
                    Military Rank
                  </label>
                  <select
                    id="military_rank"
                    value={formData.military_rank}
                    onChange={(e) => handleInputChange('military_rank', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.military_rank 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Rank</option>
                    {formData.service_branch && (() => {
                      const ranks = getMilitaryRanksForBranch(formData.service_branch);
                      return (
                        <>
                          <optgroup label="Officers">
                            {ranks.OFFICERS.map(rank => (
                              <option key={rank} value={rank}>{rank}</option>
                            ))}
                          </optgroup>
                          <optgroup label="JCOs">
                            {ranks.JCOs.map(rank => (
                              <option key={rank} value={rank}>{rank}</option>
                            ))}
                          </optgroup>
                                                     <optgroup label="NCOs">
                             {ranks.NCOs.map(rank => (
                               <option key={rank} value={rank}>{rank}</option>
                             ))}
                           </optgroup>
                           <optgroup label="Agniveers">
                             {ranks.AGNIVEERS.map(rank => (
                               <option key={rank} value={rank}>{rank}</option>
                             ))}
                           </optgroup>
                        </>
                      );
                    })()}
                  </select>
                  {errors.military_rank && (
                    <p className="mt-1 text-sm text-red-600">{errors.military_rank}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="years_experience"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange('years_experience', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.years_experience 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    min="0"
                    max="50"
                    placeholder="e.g., 15"
                  />
                  {errors.years_experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.years_experience}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="retirement_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Retirement Date
                  </label>
                  <input
                    type="date"
                    id="retirement_date"
                    value={formData.retirement_date}
                    onChange={(e) => handleInputChange('retirement_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.retirement_date 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.retirement_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.retirement_date}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Location Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="location_current" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Location
                  </label>
                  <LocationAutocomplete
                    value={formData.location_current}
                    onChange={(value) => handleInputChange('location_current', value)}
                    placeholder="Search for your current location..."
                    error={errors.location_current}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Locations (up to 3)
                  </label>
                  <div className="space-y-3">
                    {formData.locations_preferred.map((location, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <LocationAutocomplete
                          value={location}
                          onChange={(value) => handleLocationChange(index, value)}
                          placeholder={`Preferred location ${index + 1}...`}
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleLocationRemove(index)}
                          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {formData.locations_preferred.length < 3 && (
                      <button
                        type="button"
                        onClick={handleLocationAdd}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Add Location
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Web Links */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-blue-600" />
                Web Links
              </h3>
              <WebLinksEditor
                links={formData.web_links}
                onChange={(links) => handleInputChange('web_links', links)}
                error={errors.web_links}
              />
            </div>
          </div>
        ) : (
          /* Enhanced View Mode */
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{formData.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{formData.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {formData.bio && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Bio
                </h3>
                <p className="text-sm text-gray-900 bg-white p-4 rounded-lg border">{formData.bio}</p>
              </div>
            )}

            {/* Military Service */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Military Service
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Branch</label>
                  <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{formData.service_branch || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Military Rank</label>
                  <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{formData.military_rank || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{formData.years_experience || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Status</label>
                  <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-900">{formatRetirementDisplay(formData.retirement_date)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Location Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                  <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{formData.location_current || 'Not specified'}</p>
                </div>
                {formData.locations_preferred.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Locations</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.locations_preferred.map((location, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Web Links */}
            {formData.web_links && formData.web_links.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                  Web Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.web_links.map((link, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <span className="text-sm font-medium text-gray-700 capitalize">{link.type}:</span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 truncate flex-1"
                      >
                        {link.label || link.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
