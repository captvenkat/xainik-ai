'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { useAuth } from '@/lib/hooks/useAuth'
import { User, Mail, Phone, Calendar, Save, Edit3, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import LocationAutocomplete from './LocationAutocomplete'

interface ProfileData {
  name: string
  email: string
  phone?: string
  location?: string
  military_branch?: string
  military_rank?: string
  years_of_service?: number
  discharge_date?: string
  education_level?: string
  certifications?: string[]
  bio?: string
}

export default function VeteranProfileTab() {
  const { user, profile } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    military_branch: '',
    military_rank: '',
    years_of_service: 0,
    discharge_date: '',
    education_level: '',
    certifications: [],
    bio: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load profile data
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        military_branch: profile.military_branch || '',
        military_rank: profile.military_rank || '',
        years_of_service: profile.years_of_service || 0,
        discharge_date: profile.discharge_date || '',
        education_level: profile.education_level || '',
        certifications: profile.certifications || [],
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createSupabaseBrowser()
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          location: profileData.location,
          military_branch: profileData.military_branch,
          military_rank: profileData.military_rank,
          years_of_service: profileData.years_of_service,
          discharge_date: profileData.discharge_date,
          education_level: profileData.education_level,
          certifications: profileData.certifications,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to update profile')
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

  const handleCancel = () => {
    // Reset to original profile data
    if (profile) {
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        military_branch: profile.military_branch || '',
        military_rank: profile.military_rank || '',
        years_of_service: profile.years_of_service || 0,
        discharge_date: profile.discharge_date || '',
        education_level: profile.education_level || '',
        certifications: profile.certifications || [],
        bio: profile.bio || ''
      })
    }
    setIsEditing(false)
    setError('')
  }

  const addCertification = () => {
    setProfileData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), '']
    }))
  }

  const updateCertification = (index: number, value: string) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications?.map((cert, i) => i === index ? value : cert) || []
    }))
  }

  const removeCertification = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }))
  }

  const MILITARY_BRANCHES = [
    'Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force'
  ]

  const EDUCATION_LEVELS = [
    'High School', 'Associate Degree', 'Bachelor Degree', 'Master Degree', 'Doctorate', 'Trade School'
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-600">Manage your personal and military information</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
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
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                {isEditing ? (
                  <LocationAutocomplete
                    value={profileData.location || ''}
                    onChange={(location) => setProfileData(prev => ({ ...prev, location }))}
                    placeholder="Enter your city"
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                    {profileData.location || 'Not specified'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Military Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Military Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Military Branch
                </label>
                <select
                  value={profileData.military_branch || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, military_branch: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select branch</option>
                  {MILITARY_BRANCHES.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Military Rank
                </label>
                <input
                  type="text"
                  value={profileData.military_rank || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, military_rank: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="e.g., Sergeant, Lieutenant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Service
                </label>
                <input
                  type="number"
                  value={profileData.years_of_service || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, years_of_service: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discharge Date
                </label>
                <input
                  type="date"
                  value={profileData.discharge_date || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, discharge_date: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Education & Certifications */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Education & Certifications</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Level
              </label>
              <select
                value={profileData.education_level || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, education_level: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                <option value="">Select education level</option>
                {EDUCATION_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certifications
              </label>
              <div className="space-y-2">
                {profileData.certifications?.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => updateCertification(index, e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., PMP, AWS Certified"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeCertification(index)}
                        className="px-2 py-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={addCertification}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Certification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={profileData.bio || ''}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            disabled={!isEditing}
            rows={4}
            placeholder="Tell us about yourself, your military experience, and career goals..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>
    </div>
  )
}
