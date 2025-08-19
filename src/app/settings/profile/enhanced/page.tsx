'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';
import { Shield, ArrowLeft, Save, User, MapPin, Star, Link as LinkIcon, FileText, Globe } from 'lucide-react';
import Link from 'next/link';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import WebLinksEditor from '@/components/WebLinksEditor';
import {
  ProfileFormData,
  EnhancedVeteranProfile,
  ALL_MILITARY_RANKS,
  SERVICE_BRANCHES,
  validateProfileForm,
  getDefaultProfileFormData,
  parseLocationString
} from '@/types/enhanced-profile';

export default function EnhancedProfileSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [veteranProfile, setVeteranProfile] = useState<EnhancedVeteranProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<ProfileFormData | null>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>(getDefaultProfileFormData());

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
        
        // Get veteran profile with enhanced fields
        const { data: veteranData } = await supabase
          .from('veterans')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setVeteranProfile(veteranData ? {
          ...veteranData,
          military_rank: veteranData.military_rank || '',
          service_branch: veteranData.service_branch || '',
          bio: veteranData.bio || '',
          location_current: veteranData.location_current || '',
          location_current_city: veteranData.location_current_city || '',
          location_current_country: veteranData.location_current_country || '',
          locations_preferred: veteranData.locations_preferred || [],
          locations_preferred_structured: (veteranData.locations_preferred_structured as any) || [],
          web_links: (veteranData.web_links as any) || [],
          years_experience: veteranData.years_experience || 0,
          created_at: veteranData.created_at || new Date().toISOString(),
          updated_at: veteranData.updated_at || new Date().toISOString(),
          retirement_date: veteranData.retirement_date || undefined
        } : null);
        
        // Initialize form data with existing values
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

  const handleInputChange = (field: keyof ProfileFormData, value: string | string[] | any[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLocationAdd = () => {
    if (formData.locations_preferred.length >= 3) {
      setError('You can only add up to 3 preferred locations');
      return;
    }
    
    const newLocation = prompt('Enter preferred location (City, Country):');
    if (newLocation && newLocation.trim()) {
      setFormData(prev => ({
        ...prev,
        locations_preferred: [...prev.locations_preferred, newLocation.trim()]
      }));
    }
  };

  const handleLocationRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations_preferred: prev.locations_preferred.filter((_, i) => i !== index)
    }));
  };

  const saveProfile = async (data: ProfileFormData, showSuccess = true) => {
    try {
      // Validate form
      const validation = validateProfileForm(data);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return false;
      }

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: data.name,
          phone: data.phone
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Parse current location
      const currentLocationParsed = parseLocationString(data.location_current);
      
      // Parse preferred locations
      const preferredLocationsStructured = data.locations_preferred.map(loc => 
        parseLocationString(loc)
      );

      // Update or create veteran profile
      const veteranData = {
        user_id: user.id,
        rank: data.military_rank,
        service_branch: data.service_branch,
        years_experience: data.years_experience ? parseInt(data.years_experience) : 0,
        location_current: data.location_current,
        locations_preferred: data.locations_preferred,
        bio: data.bio,
        military_rank: data.military_rank,
        web_links: data.web_links,
        location_current_city: currentLocationParsed.city,
        location_current_country: currentLocationParsed.country,
        locations_preferred_structured: preferredLocationsStructured,
        retirement_date: null
      };

      if (veteranProfile) {
        // Update existing veteran profile
        const { error: veteranError } = await supabase
          .from('veterans')
          .update({
            ...veteranData,
            locations_preferred_structured: veteranData.locations_preferred_structured as any,
            web_links: veteranData.web_links as any
          })
          .eq('user_id', user.id);

        if (veteranError) throw veteranError;
      } else {
        // Create new veteran profile
        const { error: veteranError } = await supabase
          .from('veterans')
          .insert({
            ...veteranData,
            locations_preferred_structured: veteranData.locations_preferred_structured as any,
            web_links: veteranData.web_links as any
          });

        if (veteranError) throw veteranError;
      }

      if (showSuccess) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
      
      setLastSaved(new Date());
      lastSavedDataRef.current = { ...data };
      return true;
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    setValidationErrors({});

    const success = await saveProfile(formData, true);
    setIsSaving(false);
  };

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Only auto-save if data has actually changed
      if (lastSavedDataRef.current && JSON.stringify(lastSavedDataRef.current) === JSON.stringify(formData)) {
        return;
      }

      setIsAutoSaving(true);
      setError(null);
      
      await saveProfile(formData, false);
      setIsAutoSaving(false);
    }, 2000);
  }, [formData]);

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (user) {
      triggerAutoSave();
    }
  }, [formData, user, triggerAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const getMilitaryRanksForBranch = (branch: string) => {
    if (!branch || !ALL_MILITARY_RANKS[branch as keyof typeof ALL_MILITARY_RANKS]) {
      return { OFFICERS: [], JCOs: [], NCOs: [], AGNIVEERS: [] };
    }
    
    return ALL_MILITARY_RANKS[branch as keyof typeof ALL_MILITARY_RANKS];
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
              Enhanced Profile Settings
            </h1>
          </div>
          <p className="text-gray-600">
            Update your profile with intelligent features including Google Places autocomplete, military ranks, and web links
          </p>
          <div className="flex items-center gap-2 mt-2">
            {isAutoSaving ? (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Auto-saving...
              </div>
            ) : lastSaved ? (
              <div className="flex items-center text-sm text-green-600">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Changes will be saved automatically
              </div>
            )}
          </div>
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

        {/* Profile Form */}
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
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      validationErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    required
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
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
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      validationErrors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="+91XXXXXXXXXX"
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
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
                  About You
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  maxLength={600}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    validationErrors.bio ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                />
                <div className="mt-1 flex justify-between text-sm text-gray-500">
                  <span>Share your story and professional background</span>
                  <span>{formData.bio.length}/600</span>
                </div>
                {validationErrors.bio && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.bio}</p>
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Branch</option>
                    {SERVICE_BRANCHES.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="military_rank" className="block text-sm font-medium text-gray-700">
                    Military Rank
                  </label>
                  <select
                    id="military_rank"
                    value={formData.military_rank}
                    onChange={(e) => handleInputChange('military_rank', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={!formData.service_branch}
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                    max="50"
                    placeholder="e.g., 15"
                  />
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
                    error={validationErrors.location_current}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Locations (up to 3)
                  </label>
                  <div className="space-y-2">
                    {formData.locations_preferred.map((location, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <LocationAutocomplete
                          value={location}
                          onChange={(value) => {
                            const newLocations = [...formData.locations_preferred];
                            newLocations[index] = value;
                            handleInputChange('locations_preferred', newLocations);
                          }}
                          placeholder={`Preferred location ${index + 1}...`}
                          error={validationErrors[`locations_preferred.${index}`]}
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
                error={validationErrors.web_links}
              />
            </div>
          </div>

          {/* Auto-save status */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isAutoSaving ? (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Auto-saving your changes...
                  </div>
                ) : lastSaved ? (
                  <div className="flex items-center text-green-600">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </div>
                ) : (
                  <span>Changes will be saved automatically</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Done
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
