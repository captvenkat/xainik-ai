'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Edit, 
  Check,
  X,
  Briefcase,
  Globe,
  Settings
} from 'lucide-react'
import PhotoUpload from '@/components/PhotoUpload'

interface RecruiterProfileData {
  name: string
  email: string
  phone: string
  company_name: string
  industry: string
  location: string
  avatar_url?: string
  bio?: string
  website?: string
  linkedin_url?: string
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Non-profit',
  'Consulting',
  'Real Estate',
  'Transportation',
  'Energy',
  'Media & Entertainment',
  'Other'
]

export default function RecruiterProfile() {
  const [profile, setProfile] = useState<RecruiterProfileData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    industry: '',
    location: '',
    bio: '',
    website: '',
    linkedin_url: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      // First, ensure user has a record in the users table with recruiter role
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist in users table, create them with recruiter role
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Recruiter',
            role: 'recruiter'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating user:', createError)
          setError('Failed to create user profile')
          return
        }
      } else if (userError) {
        console.error('Error loading user:', userError)
        setError('Failed to load user profile')
        return
      }

      // Now get the user profile (either existing or newly created)
      const { data: finalUserProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get recruiter profile
      const { data: recruiterProfile } = await supabase
        .from('recruiters')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (finalUserProfile) {
        setProfile({
          name: finalUserProfile.name || '',
          email: finalUserProfile.email || '',
          phone: finalUserProfile.phone || '',
          company_name: recruiterProfile?.company_name || '',
          industry: recruiterProfile?.industry || '',
          location: finalUserProfile.location || '',
          avatar_url: finalUserProfile.avatar_url,
          bio: recruiterProfile?.bio || '',
          website: recruiterProfile?.website || '',
          linkedin_url: recruiterProfile?.linkedin_url || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!profile.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!profile.company_name.trim()) {
      newErrors.company_name = 'Company name is required'
    }

    if (!profile.industry.trim()) {
      newErrors.industry = 'Industry is required'
    }

    if (profile.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profile.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }

    if (profile.linkedin_url && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(profile.linkedin_url)) {
      newErrors.linkedin_url = 'Please enter a valid LinkedIn URL'
    }

    if (profile.bio && profile.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
          avatar_url: profile.avatar_url
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Update or create recruiter profile
      const recruiterData = {
        user_id: user.id,
        company_name: profile.company_name,
        industry: profile.industry,
        bio: profile.bio,
        website: profile.website,
        linkedin_url: profile.linkedin_url
      }

      const { data: existingRecruiter, error: checkError } = await supabase
        .from('recruiters')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        // Recruiter profile doesn't exist, create it
        const { error: recruiterError } = await supabase
          .from('recruiters')
          .insert(recruiterData)

        if (recruiterError) throw recruiterError
      } else if (checkError) {
        throw checkError
      } else {
        // Recruiter profile exists, update it
        const { error: recruiterError } = await supabase
          .from('recruiters')
          .update(recruiterData)
          .eq('user_id', user.id)

        if (recruiterError) throw recruiterError
      }

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
    loadProfile() // Reload original data
  }

  const handlePhotoChange = (photoUrl: string, isCustom: boolean) => {
    setProfile(prev => ({
      ...prev,
      avatar_url: photoUrl
    }))
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Recruiter Profile</h2>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="p-6 space-y-8">
        {/* Profile Photo */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Profile Photo
          </h3>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <PhotoUpload
                profilePhotoUrl={profile.avatar_url}
                onPhotoChange={handlePhotoChange}
                size="lg"
                showCrop={true}
                className="w-32 h-32"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                Upload a professional photo to build trust with veterans.
              </p>
              <p className="text-xs text-gray-500">
                Recommended: Square image, high resolution, professional attire
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="recruiter-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="recruiter-name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md ${
                  isEditing 
                    ? errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="recruiter-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="recruiter-email"
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>
            <div>
              <label htmlFor="recruiter-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="recruiter-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                placeholder="+91XXXXXXXXXX"
                className={`w-full px-3 py-2 border rounded-md ${
                  isEditing 
                    ? errors.phone 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="recruiter-location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                id="recruiter-location"
                type="text"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                disabled={!isEditing}
                placeholder="City, Country"
                className={`w-full px-3 py-2 border rounded-md ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-400" />
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="recruiter-company-name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                id="recruiter-company-name"
                type="text"
                value={profile.company_name}
                onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md ${
                  isEditing 
                    ? errors.company_name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
            </div>
            <div>
              <label htmlFor="recruiter-industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                id="recruiter-industry"
                value={profile.industry}
                onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md ${
                  isEditing 
                    ? errors.industry 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-400" />
            Bio
          </h3>
          <div>
            <label htmlFor="recruiter-bio" className="block text-sm font-medium text-gray-700 mb-2">
              About Your Company
            </label>
            <textarea
              id="recruiter-bio"
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              rows={4}
              placeholder="Tell veterans about your company, culture, and what makes you a great employer..."
              className={`w-full px-3 py-2 border rounded-md ${
                isEditing 
                  ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-gray-200 bg-gray-50'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              {profile.bio?.length || 0}/500 characters
            </p>
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
          </div>
        </div>

        {/* Web Links */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-400" />
            Web Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="recruiter-website" className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <input
                id="recruiter-website"
                type="url"
                value={profile.website}
                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
                placeholder="https://yourcompany.com"
                className={`w-full px-3 py-2 border rounded-md ${
                  isEditing 
                    ? errors.website 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
            </div>
            <div>
              <label htmlFor="recruiter-linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile
              </label>
              <input
                id="recruiter-linkedin"
                type="url"
                value={profile.linkedin_url}
                onChange={(e) => setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/yourprofile"
                className={`w-full px-3 py-2 border rounded-md ${
                  isEditing 
                    ? errors.linkedin_url 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.linkedin_url && <p className="mt-1 text-sm text-red-600">{errors.linkedin_url}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
