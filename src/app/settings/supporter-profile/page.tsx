'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  Shield, ArrowLeft, Save, User, MapPin, Star, Link as LinkIcon, 
  Building, Briefcase, Heart, CheckCircle, Edit, X
} from 'lucide-react'
import Link from 'next/link'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import PhotoUpload from '@/components/PhotoUpload'

interface SupporterProfileData {
  name: string
  location: string
  professional_title: string
  company: string
  industry: string
  bio: string
  linkedin_url: string
  areas_of_support: string[]
}

const AREAS_OF_SUPPORT = [
  'Job Referrals',
  'Career Mentoring',
  'Network Connections',
  'Skill Development',
  'Industry Insights',
  'Resume Review',
  'Interview Prep',
  'Business Opportunities'
]

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Consulting',
  'Education',
  'Government',
  'Non-Profit',
  'Retail',
  'Other'
]

export default function SupporterProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [supporterProfile, setSupporterProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  // Form state
  const [formData, setFormData] = useState<SupporterProfileData>({
    name: '',
    location: '',
    professional_title: '',
    company: '',
    industry: '',
    bio: '',
    linkedin_url: '',
    areas_of_support: []
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth')
          return
        }
        
        setUser(user)
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData?.role !== 'supporter') {
          router.push('/dashboard')
          return
        }
        
        setProfile(profileData)
        
        // Get supporter profile
        const { data: supporterData } = await supabase
          .from('supporters')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        setSupporterProfile(supporterData)
        
        // Initialize form data
        setFormData({
          name: profileData?.name || '',
          location: profileData?.location || '',
          professional_title: supporterData?.professional_title || '',
          company: supporterData?.company || '',
          industry: supporterData?.industry || '',
          bio: supporterData?.bio || supporterData?.intro || '',
          linkedin_url: supporterData?.linkedin_url || '',
          areas_of_support: supporterData?.areas_of_support || []
        })
        
      } catch (error) {
        console.error('Error fetching user:', error)
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  const handleInputChange = (field: keyof SupporterProfileData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-save for non-critical fields
    if (isEditing && ['bio', 'professional_title', 'company', 'industry'].includes(field)) {
      autoSave()
    }
  }

  const handlePhotoChange = (photoUrl: string, isCustom: boolean) => {
    setProfile((prev: any) => ({
      ...prev,
      avatar_url: photoUrl
    }))
    
    // Auto-save photo
    if (isEditing) {
      autoSave()
    }
  }

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      location: value
    }))
    
    // Auto-save location
    if (isEditing) {
      autoSave()
    }
  }

  const handleAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas_of_support: prev.areas_of_support.includes(area)
        ? prev.areas_of_support.filter(a => a !== area)
        : [...prev.areas_of_support, area]
    }))
    
    // Auto-save areas of support
    if (isEditing) {
      autoSave()
    }
  }

  const autoSave = async () => {
    try {
      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          location: formData.location,
          avatar_url: profile?.avatar_url || null
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Update or create supporter profile
      const supporterData = {
        user_id: user.id,
        professional_title: formData.professional_title,
        company: formData.company,
        industry: formData.industry,
        bio: formData.bio,
        intro: formData.bio, // Keep backward compatibility
        linkedin_url: formData.linkedin_url,
        areas_of_support: formData.areas_of_support
      }

      if (supporterProfile) {
        const { error: supporterError } = await supabase
          .from('supporters')
          .update(supporterData)
          .eq('user_id', user.id)

        if (supporterError) throw supporterError
      } else {
        const { error: supporterError } = await supabase
          .from('supporters')
          .insert(supporterData)

        if (supporterError) throw supporterError
      }

      // Show subtle success indicator
      setSuccess('Saved')
      setTimeout(() => setSuccess(null), 2000)
      
    } catch (error) {
      console.error('Auto-save error:', error)
      // Don't show error for auto-save to avoid disrupting user experience
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await autoSave()
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Refresh profile data
      const { data: newProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(newProfile)
      
      const { data: newSupporterProfile } = await supabase
        .from('supporters')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setSupporterProfile(newSupporterProfile)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Your Profile...</h2>
          <p className="text-gray-600">Preparing your supporter profile.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/supporter" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Your Supporter Profile
              </h1>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          <p className="text-gray-600">
            {isEditing 
              ? "Edit your profile to help veterans understand how you can support them. Changes are auto-saved."
              : "Your profile helps veterans understand how you can support them in their civilian career transition."
            }
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <X className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Photo Section */}
          <div className="p-8 border-b border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Profile Photo</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {isEditing 
                  ? "Upload a professional photo to build trust with veterans. Changes are auto-saved."
                  : "A professional photo helps veterans trust your support and guidance. Click 'Edit Profile' to upload or change your photo."
                }
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="flex flex-col items-center space-y-6">
                <PhotoUpload
                  profilePhotoUrl={profile?.avatar_url}
                  onPhotoChange={handlePhotoChange}
                  size="lg"
                  showCrop={true}
                  className="w-32 h-32"
                  disabled={!isEditing}
                  readOnly={!isEditing}
                />
                {isEditing && (
                  <div className="text-center max-w-xs">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Click to upload • Drag & drop supported • Recommended: Square image, high resolution
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Core Information */}
          <div className="p-8 space-y-8">
            {/* Name & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {formData.name || 'Not provided'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={handleLocationChange}
                    placeholder="Search for your location..."
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {formData.location || 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            {/* Professional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.professional_title}
                    onChange={(e) => handleInputChange('professional_title', e.target.value)}
                    placeholder="e.g., HR Director, Tech Recruiter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {formData.professional_title || 'Not provided'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company/Organization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Where you work (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {formData.company || 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            {/* Industry */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              {isEditing ? (
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {formData.industry || 'Not provided'}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Statement
              </label>
              {isEditing ? (
                <div className="relative">
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    maxLength={150}
                    placeholder="Share your mission for supporting veterans (max 150 characters)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.bio.length}/150
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[60px]">
                  {formData.bio || 'Not provided'}
                </div>
              )}
            </div>

            {/* LinkedIn */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {formData.linkedin_url ? (
                    <a 
                      href={formData.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </div>
              )}
            </div>

            {/* Areas of Support */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How You Support Veterans
              </label>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {AREAS_OF_SUPPORT.map((area) => (
                    <label key={area} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.areas_of_support.includes(area)}
                        onChange={() => handleAreaToggle(area)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg min-h-[60px]">
                  {formData.areas_of_support.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.areas_of_support.map((area) => (
                        <span 
                          key={area}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {area}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">No areas specified</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          {!isEditing && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Summary</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {formData.name || 'Not provided'}</p>
                <p><strong>Location:</strong> {formData.location || 'Not provided'}</p>
                <p><strong>Role:</strong> {formData.professional_title || 'Not provided'}</p>
                <p><strong>Company:</strong> {formData.company || 'Not provided'}</p>
                <p><strong>Industry:</strong> {formData.industry || 'Not provided'}</p>
                <p><strong>Areas of Support:</strong> {formData.areas_of_support.length} selected</p>
              </div>
            </div>
          )}
        </div>

        {/* Mission Reminder */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
          <div className="text-center">
            <div className="text-3xl mb-3">🪖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Your Mission Matters</h3>
            <p className="text-gray-700 mb-4">
              Every detail in your profile helps veterans understand how you can support them. 
              <strong> Your guidance can change lives.</strong>
            </p>
            <div className="text-sm text-gray-600">
              Veterans are looking for supporters like you to help them transition to civilian careers.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
