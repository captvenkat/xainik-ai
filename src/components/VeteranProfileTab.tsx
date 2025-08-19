'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { useAuth } from '@/lib/hooks/useAuth'
import { User, Mail, Phone, Calendar, Save, Edit3, CheckCircle, AlertCircle, ArrowLeft, MapPin, Star, Link as LinkIcon, FileText, Shield } from 'lucide-react'
import Link from 'next/link'
import LocationAutocomplete from './LocationAutocomplete'
import WebLinksEditor from './WebLinksEditor'
import { 
  ProfileFormData, 
  validateProfileForm, 
  ALL_MILITARY_RANKS,
  SERVICE_BRANCHES,
  getDefaultProfileFormData,
  parseLocationString
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
          web_links: veteranData?.web_links || []
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

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    setError('')
    setSuccess('')
    setErrors({})

    // Validate form
    const validationResult = validateProfileForm(formData)
    if (!validationResult.isValid) {
      setErrors(validationResult.errors)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createSupabaseBrowser()
      
      // Parse locations for structured storage
      const locationCurrentParsed = parseLocationString(formData.location_current)
      const locationsPreferredParsed = formData.locations_preferred
        .filter(loc => loc.trim())
        .map(loc => parseLocationString(loc))

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Update or create veteran profile
      const veteranData = {
        user_id: user.id,
        military_rank: formData.military_rank,
        service_branch: formData.service_branch,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        bio: formData.bio,
        location_current: formData.location_current,
        location_current_city: locationCurrentParsed.city,
        location_current_country: locationCurrentParsed.country,
        locations_preferred: formData.locations_preferred.filter(loc => loc.trim()),
        locations_preferred_structured: locationsPreferredParsed,
        web_links: formData.web_links
      }

      if (veteranProfile) {
        // Update existing veteran profile
        const { error: veteranError } = await supabase
          .from('veterans')
          .update(veteranData)
          .eq('user_id', user.id)

        if (veteranError) throw veteranError
      } else {
        // Create new veteran profile
        const { error: veteranError } = await supabase
          .from('veterans')
          .insert(veteranData)

        if (veteranError) throw veteranError
      }

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Enhanced Profile</h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
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
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.phone 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
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
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Bio
              </h3>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Tell us about yourself
                </label>
                <div className="mt-1 relative">
                  <textarea
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className={`block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.bio 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Share your story, achievements, or what you're looking for..."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.bio.length}/600
                  </div>
                </div>
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                )}
              </div>
            </div>

            {/* Military Service */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-gray-400" />
                Military Service
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="service_branch" className="block text-sm font-medium text-gray-700">
                    Service Branch
                  </label>
                  <select
                    id="service_branch"
                    value={formData.service_branch}
                    onChange={(e) => handleInputChange('service_branch', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.service_branch 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
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
                  <label htmlFor="military_rank" className="block text-sm font-medium text-gray-700">
                    Military Rank
                  </label>
                  <select
                    id="military_rank"
                    value={formData.military_rank}
                    onChange={(e) => handleInputChange('military_rank', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.military_rank 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Select Rank</option>
                    {formData.service_branch && ALL_MILITARY_RANKS[formData.service_branch as keyof typeof ALL_MILITARY_RANKS] ? (
                      Object.values(ALL_MILITARY_RANKS[formData.service_branch as keyof typeof ALL_MILITARY_RANKS]).flat().map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))
                    ) : (
                      Object.values(ALL_MILITARY_RANKS['Indian Army']).flat().map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))
                    )}
                  </select>
                  {errors.military_rank && (
                    <p className="mt-1 text-sm text-red-600">{errors.military_rank}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="years_experience"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange('years_experience', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.years_experience 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    min="0"
                    max="50"
                    placeholder="e.g., 15"
                  />
                  {errors.years_experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.years_experience}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                Location Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="location_current" className="block text-sm font-medium text-gray-700">
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
                          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {formData.locations_preferred.length < 3 && (
                      <button
                        type="button"
                        onClick={handleLocationAdd}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Location
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Web Links */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-gray-400" />
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
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{formData.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{formData.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {formData.bio && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  Bio
                </h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md">{formData.bio}</p>
              </div>
            )}

            {/* Military Service */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-gray-400" />
                Military Service
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Branch</label>
                  <p className="mt-1 text-sm text-gray-900">{formData.service_branch || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Military Rank</label>
                  <p className="mt-1 text-sm text-gray-900">{formData.military_rank || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{formData.years_experience || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                Location Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Location</label>
                  <p className="mt-1 text-sm text-gray-900">{formData.location_current || 'Not specified'}</p>
                </div>
                {formData.locations_preferred.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Locations</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {formData.locations_preferred.map((location, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                  Web Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.web_links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-700 capitalize">{link.type}:</span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 truncate"
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
