'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';
import { Shield, ArrowLeft, Save, User, MapPin, Star, Link as LinkIcon, FileText, Globe } from 'lucide-react';
import Link from 'next/link';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import WebLinksEditor from '@/components/WebLinksEditor';
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
  const [profile, setProfile] = useState<any>(null);
  const [veteranProfile, setVeteranProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  // Enhanced form state
  const [formData, setFormData] = useState<ProfileFormData>(getDefaultProfileFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth');
          return;
        }
        
        setUser(user);
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);
        
        // Get veteran profile
        const { data: veteranData } = await supabase
          .from('veterans')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setVeteranProfile(veteranData);
        
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
        });
        
      } catch (error) {
        console.error('Error fetching user:', error);
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

  const handleLocationAdd = () => {
    if (formData.locations_preferred.length < 3) {
      setFormData(prev => ({
        ...prev,
        locations_preferred: [...prev.locations_preferred, '']
      }));
    }
  };

  const handleLocationRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations_preferred: prev.locations_preferred.filter((_, i) => i !== index)
    }));
  };

  const handleLocationChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      locations_preferred: prev.locations_preferred.map((loc, i) => 
        i === index ? value : loc
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    setErrors({});

    // Validate form
    const validationResult = validateProfileForm(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      setIsSaving(false);
      return;
    }

    try {
      // Parse locations for structured storage
      const locationCurrentParsed = parseLocationString(formData.location_current);
      const locationsPreferredParsed = formData.locations_preferred
        .filter(loc => loc.trim())
        .map(loc => parseLocationString(loc));

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update or create veteran profile
      const veteranData = {
        user_id: user.id,
        rank: formData.military_rank,
        military_rank: formData.military_rank,
        service_branch: formData.service_branch,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : 0,
        bio: formData.bio,
        location_current: formData.location_current,
        location_current_city: locationCurrentParsed.city,
        location_current_country: locationCurrentParsed.country,
        locations_preferred: formData.locations_preferred.filter(loc => loc.trim()),
        locations_preferred_structured: locationsPreferredParsed as any,
        web_links: formData.web_links as any,
        retirement_date: null
      };

      if (veteranProfile) {
        // Update existing veteran profile
        const { error: veteranError } = await supabase
          .from('veterans')
          .update(veteranData)
          .eq('user_id', user.id);

        if (veteranError) throw veteranError;
      } else {
        // Create new veteran profile
        const { error: veteranError } = await supabase
          .from('veterans')
          .insert(veteranData);

        if (veteranError) throw veteranError;
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
        .from('veterans')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setVeteranProfile(newVeteranProfile);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/veteran" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
          </div>
          <p className="text-gray-600">
            Update your profile information and military service details - Enhanced Form v2.0
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Enhanced Profile Information</h2>
          </div>
          
          <div className="p-6 space-y-8">
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

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
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
        </form>
      </div>
    </div>
  );
}
