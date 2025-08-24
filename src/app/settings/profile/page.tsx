'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';
import { Shield, ArrowLeft, Save, User, MapPin, Star, Link as LinkIcon, FileText, Globe, Sparkles, CheckCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import WebLinksEditor from '@/components/WebLinksEditor';
import PhotoUpload from '@/components/PhotoUpload';
import { 
  ProfileFormData, 
  validateProfileForm, 
  validateBio, 
  validateLocation, 
  ALL_MILITARY_RANKS,
  SERVICE_BRANCHES,
  getDefaultProfileFormData,
  parseLocationString
} from '@/types/enhanced-profile';

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [veteranProfile, setVeteranProfile] = useState<{
    id: string;
    user_id: string;
    profile_type: string;
    profile_data: any;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  // Enhanced form state
  const [formData, setFormData] = useState<ProfileFormData>(getDefaultProfileFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth');
          return;
        }
        
        setUser(user);
        
        // Get user profile - handle case where user might not exist in users table
        let profileData = null;
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            // Error fetching user profile
          } else {
            profileData = data;
          }
        } catch (error) {
          // Error in user profile query
        }
        
        setProfile(profileData);
        
        // Get veteran profile - handle case where veteran profile might not exist
        // Fetch user profile data from user_profiles table
        let userProfileData = null;
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .eq('profile_type', 'veteran')
            .eq('is_active', true)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            // Error fetching user profile
          } else {
            userProfileData = data;
          }
        } catch (error) {
          // Error in user profile query
        }
        
        setVeteranProfile(userProfileData);
        
        // Initialize enhanced form data
        setFormData({
          name: profileData?.name || '',
          phone: profileData?.phone || '',
          military_rank: userProfileData?.profile_data?.military_rank || '',
          service_branch: userProfileData?.profile_data?.service_branch || '',
          years_experience: userProfileData?.profile_data?.years_experience?.toString() || '',
          bio: userProfileData?.profile_data?.bio || '',
          location_current: userProfileData?.profile_data?.location_current || '',
          locations_preferred: userProfileData?.profile_data?.locations_preferred || [],
          web_links: userProfileData?.profile_data?.web_links || [],
          retirement_date: userProfileData?.profile_data?.retirement_date || '',
          photo_url: profileData?.avatar_url || ''
        });
        
      } catch (error) {
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhotoChange = (photoUrl: string, isCustom: boolean) => {
    // Handle photo change logic here
    // photoUrl is the data URL or file URL
    // isCustom indicates if it's a user-uploaded photo
    
    if (photoUrl) {
      // Update the profile state with the new photo
      setProfile(prev => prev ? {
        ...prev,
        avatar_url: photoUrl
      } : null);
      
      // Store the photo URL for later upload
      setFormData(prev => ({
        ...prev,
        photo_url: photoUrl
      }));
    } else {
      // Remove the photo
      setProfile(prev => prev ? {
        ...prev,
        avatar_url: null
      } : null);
      
      setFormData(prev => ({
        ...prev,
        photo_url: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationResult = validateProfileForm(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // First, ensure user exists in users table
      let userProfile = profile;
      if (!userProfile) {
        // Create user profile if it doesn't exist
        const { data: newUserProfile, error: createUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: formData.name,
            phone: formData.phone,
            role: 'veteran',
            avatar_url: formData.photo_url || null,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createUserError) {
          throw new Error('Failed to create user profile');
        }
        
        userProfile = newUserProfile;
        setProfile(userProfile);
      } else {
        // Update existing user profile
        const { error: userError } = await supabase
          .from('users')
          .update({
            name: formData.name,
            phone: formData.phone,
            avatar_url: formData.photo_url || null
          })
          .eq('id', user.id);

        if (userError) throw userError;
      }

      // Prepare veteran profile data
      const veteranData = {
        user_id: user.id,
        military_rank: formData.military_rank,
        service_branch: formData.service_branch,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        bio: formData.bio,
        location_current: formData.location_current,
        locations_preferred: formData.locations_preferred,
        web_links: formData.web_links,
        retirement_date: formData.retirement_date
      };

      if (veteranProfile) {
        // Update existing user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            profile_data: veteranData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('profile_type', 'veteran');

        if (profileError) throw profileError;
      } else {
        // Create new user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            profile_type: 'veteran',
            profile_data: veteranData,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) throw profileError;
      }

      setSuccess('Profile updated successfully!');
      
      // Refresh profile data
      const { data: newProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(newProfile);
      
      const { data: newVeteranProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_type', 'veteran')
        .eq('is_active', true)
        .single();
      
      setVeteranProfile(newVeteranProfile);
      
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/veteran" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Complete Your Profile
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Let's get your profile ready so Xainik can work its magic! 
              <span className="block text-sm text-blue-600 mt-2">
                🤖 Our AI will optimize everything for maximum impact
              </span>
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                    step <= currentStep 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < totalSteps && (
                    <div className={`w-16 h-1 mx-2 rounded transition-all duration-200 ${
                      step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}: {
                  currentStep === 1 ? 'Basic Info' :
                  currentStep === 2 ? 'Military Service' :
                  currentStep === 3 ? 'Location & Bio' :
                  'Review & Save'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-medium text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-center">
            <div className="text-lg font-medium text-red-800">{error}</div>
          </div>
        )}

        {/* Enhanced Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step Content */}
          <div className="p-8">
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">👤</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Let's start with the essentials</p>
                </div>

                {/* Profile Photo */}
                <div className="text-center">
                  <PhotoUpload
                    profilePhotoUrl={profile?.avatar_url}
                    onPhotoChange={handlePhotoChange}
                    size="lg"
                    showCrop={true}
                    className="w-32 h-32 mx-auto"
                  />
                  <p className="text-sm text-gray-600 mt-3">
                    A professional photo helps you stand out
                  </p>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.name 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'
                      } focus:ring-4 focus:outline-none`}
                      placeholder="Your full name"
                      required
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.phone 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'
                      } focus:ring-4 focus:outline-none`}
                      placeholder="+91XXXXXXXXXX"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Email is set during signup and cannot be modified
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">🎖️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Military Service</h2>
                  <p className="text-gray-600">Your military background helps Xainik AI match you with the right opportunities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="service_branch" className="block text-sm font-semibold text-gray-700 mb-2">
                      Service Branch *
                    </label>
                    <select
                      id="service_branch"
                      value={formData.service_branch}
                      onChange={(e) => handleInputChange('service_branch', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.service_branch 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'
                      } focus:ring-4 focus:outline-none`}
                    >
                      <option value="">Select your service branch</option>
                      {SERVICE_BRANCHES.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                    {errors.service_branch && (
                      <p className="mt-2 text-sm text-red-600">{errors.service_branch}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="military_rank" className="block text-sm font-semibold text-gray-700 mb-2">
                      Military Rank *
                    </label>
                    <select
                      id="military_rank"
                      value={formData.military_rank}
                      onChange={(e) => handleInputChange('military_rank', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.military_rank 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'
                      } focus:ring-4 focus:outline-none`}
                    >
                      <option value="">Select your rank</option>
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
                      <p className="mt-2 text-sm text-red-600">{errors.military_rank}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="years_experience" className="block text-sm font-semibold text-gray-700 mb-2">
                      Years of Service
                    </label>
                    <input
                      type="number"
                      id="years_experience"
                      value={formData.years_experience}
                      onChange={(e) => handleInputChange('years_experience', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="e.g., 15"
                      min="0"
                      max="50"
                    />
                  </div>

                  <div>
                    <label htmlFor="retirement_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Retirement Date
                    </label>
                    <input
                      type="date"
                      id="retirement_date"
                      value={formData.retirement_date}
                      onChange={(e) => handleInputChange('retirement_date', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">📍</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Bio</h2>
                  <p className="text-gray-600">Help recruiters find you and understand your story</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location_current" className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Location *
                    </label>
                    <LocationAutocomplete
                      value={formData.location_current}
                      onChange={(value) => handleInputChange('location_current', value)}
                      placeholder="Enter your current city"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.location_current 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'
                      } focus:ring-4 focus:outline-none`}
                    />
                    {errors.location_current && (
                      <p className="mt-2 text-sm text-red-600">{errors.location_current}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="locations_preferred" className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Locations
                    </label>
                    <input
                      type="text"
                      id="locations_preferred"
                      value={formData.locations_preferred.join(', ')}
                      onChange={(e) => handleInputChange('locations_preferred', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      placeholder="Mumbai, Delhi, Bangalore"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter up to 3 cities, separated by commas
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Story *
                  </label>
                  <div className="relative">
                    <textarea
                      id="bio"
                      rows={6}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        errors.bio 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'
                      } focus:ring-4 focus:outline-none resize-none`}
                      placeholder="Tell us about your military experience, achievements, and what you're looking for in your civilian career..."
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                      {formData.bio.length}/600
                    </div>
                  </div>
                  {errors.bio && (
                    <p className="mt-2 text-sm text-red-600">{errors.bio}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Don't worry about perfect wording - Xainik AI will help optimize this
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">✨</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Save</h2>
                  <p className="text-gray-600">Let's review your information before saving</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <p className="text-gray-900">{formData.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone:</span>
                      <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Service Branch:</span>
                      <p className="text-gray-900">{formData.service_branch || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Military Rank:</span>
                      <p className="text-gray-900">{formData.military_rank || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Current Location:</span>
                      <p className="text-gray-900">{formData.location_current || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Years of Service:</span>
                      <p className="text-gray-900">{formData.years_experience || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bio:</span>
                    <p className="text-gray-900 mt-1">{formData.bio || 'Not provided'}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <Sparkles className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Launch!</h3>
                  <p className="text-blue-700">
                    Once you save, Xainik AI will automatically optimize your profile for maximum impact with recruiters and opportunities.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* AI Assistance Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Xainik AI is here to help optimize your profile for maximum impact
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-semibold text-blue-600">🤖 AI Optimization</div>
                <div className="text-sm text-blue-600">Automated profile enhancement</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="font-semibold text-green-600">🎯 Smart Matching</div>
                <div className="text-sm text-green-600">Connect with right opportunities</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="font-semibold text-purple-600">📊 Performance Tracking</div>
                <div className="text-sm text-purple-600">Monitor your success</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
