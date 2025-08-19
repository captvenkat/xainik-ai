// Enhanced Profile System Types
// Comprehensive types for intelligent profile features

export interface WebLink {
  id: string;
  type: 'linkedin' | 'twitter' | 'youtube' | 'github' | 'website';
  url: string;
  label?: string;
  isActive: boolean;
}

export interface LocationStructured {
  city: string;
  country: string;
  full: string;
}

export interface EnhancedVeteranProfile {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  military_rank?: string;
  service_branch?: string;
  years_experience?: number;
  bio?: string;
  location_current_city?: string;
  location_current_country?: string;
  location_current?: string;
  locations_preferred?: string[];
  locations_preferred_structured?: LocationStructured[];
  web_links?: WebLink[];
  rank?: string; // Legacy field
  created_at?: string;
  updated_at?: string;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  military_rank: string;
  service_branch: string;
  years_experience: string;
  bio: string;
  location_current: string;
  locations_preferred: string[];
  web_links: WebLink[];
}

// Military Rank Options
export const MILITARY_RANKS = {
  GENERAL: [
    'Field Marshal',
    'General',
    'Lieutenant General',
    'Major General',
    'Brigadier',
    'Colonel',
    'Lieutenant Colonel',
    'Major',
    'Captain',
    'Lieutenant',
    'Second Lieutenant'
  ],
  RETIRED: [
    'Retired General',
    'Retired Lieutenant General',
    'Retired Major General',
    'Retired Brigadier',
    'Retired Colonel',
    'Retired Lieutenant Colonel',
    'Retired Major',
    'Retired Captain',
    'Retired Lieutenant',
    'Retired Second Lieutenant'
  ],
  VETERAN: [
    'Veteran General',
    'Veteran Lieutenant General',
    'Veteran Major General',
    'Veteran Brigadier',
    'Veteran Colonel',
    'Veteran Lieutenant Colonel',
    'Veteran Major',
    'Veteran Captain',
    'Veteran Lieutenant',
    'Veteran Second Lieutenant'
  ],
  EX_SERVICEMAN: [
    'Ex-Serviceman General',
    'Ex-Serviceman Lieutenant General',
    'Ex-Serviceman Major General',
    'Ex-Serviceman Brigadier',
    'Ex-Serviceman Colonel',
    'Ex-Serviceman Lieutenant Colonel',
    'Ex-Serviceman Major',
    'Ex-Serviceman Captain',
    'Ex-Serviceman Lieutenant',
    'Ex-Serviceman Second Lieutenant'
  ]
} as const;

// Navy Ranks
export const NAVY_RANKS = {
  GENERAL: [
    'Admiral of the Fleet',
    'Admiral',
    'Vice Admiral',
    'Rear Admiral',
    'Commodore',
    'Captain',
    'Commander',
    'Lieutenant Commander',
    'Lieutenant',
    'Sub Lieutenant',
    'Acting Sub Lieutenant'
  ],
  RETIRED: [
    'Retired Admiral',
    'Retired Vice Admiral',
    'Retired Rear Admiral',
    'Retired Commodore',
    'Retired Captain',
    'Retired Commander',
    'Retired Lieutenant Commander',
    'Retired Lieutenant',
    'Retired Sub Lieutenant',
    'Retired Acting Sub Lieutenant'
  ],
  VETERAN: [
    'Veteran Admiral',
    'Veteran Vice Admiral',
    'Veteran Rear Admiral',
    'Veteran Commodore',
    'Veteran Captain',
    'Veteran Commander',
    'Veteran Lieutenant Commander',
    'Veteran Lieutenant',
    'Veteran Sub Lieutenant',
    'Veteran Acting Sub Lieutenant'
  ],
  EX_SERVICEMAN: [
    'Ex-Serviceman Admiral',
    'Ex-Serviceman Vice Admiral',
    'Ex-Serviceman Rear Admiral',
    'Ex-Serviceman Commodore',
    'Ex-Serviceman Captain',
    'Ex-Serviceman Commander',
    'Ex-Serviceman Lieutenant Commander',
    'Ex-Serviceman Lieutenant',
    'Ex-Serviceman Sub Lieutenant',
    'Ex-Serviceman Acting Sub Lieutenant'
  ]
} as const;

// Air Force Ranks
export const AIR_FORCE_RANKS = {
  GENERAL: [
    'Marshal of the Indian Air Force',
    'Air Chief Marshal',
    'Air Marshal',
    'Air Vice Marshal',
    'Air Commodore',
    'Group Captain',
    'Wing Commander',
    'Squadron Leader',
    'Flight Lieutenant',
    'Flying Officer',
    'Pilot Officer'
  ],
  RETIRED: [
    'Retired Air Chief Marshal',
    'Retired Air Marshal',
    'Retired Air Vice Marshal',
    'Retired Air Commodore',
    'Retired Group Captain',
    'Retired Wing Commander',
    'Retired Squadron Leader',
    'Retired Flight Lieutenant',
    'Retired Flying Officer',
    'Retired Pilot Officer'
  ],
  VETERAN: [
    'Veteran Air Chief Marshal',
    'Veteran Air Marshal',
    'Veteran Air Vice Marshal',
    'Veteran Air Commodore',
    'Veteran Group Captain',
    'Veteran Wing Commander',
    'Veteran Squadron Leader',
    'Veteran Flight Lieutenant',
    'Veteran Flying Officer',
    'Veteran Pilot Officer'
  ],
  EX_SERVICEMAN: [
    'Ex-Serviceman Air Chief Marshal',
    'Ex-Serviceman Air Marshal',
    'Ex-Serviceman Air Vice Marshal',
    'Ex-Serviceman Air Commodore',
    'Ex-Serviceman Group Captain',
    'Ex-Serviceman Wing Commander',
    'Ex-Serviceman Squadron Leader',
    'Ex-Serviceman Flight Lieutenant',
    'Ex-Serviceman Flying Officer',
    'Ex-Serviceman Pilot Officer'
  ]
} as const;

// All Military Ranks Combined
export const ALL_MILITARY_RANKS = {
  'Indian Army': MILITARY_RANKS,
  'Indian Navy': NAVY_RANKS,
  'Indian Air Force': AIR_FORCE_RANKS
} as const;

// Service Branch Options
export const SERVICE_BRANCHES = [
  'Indian Army',
  'Indian Navy',
  'Indian Air Force',
  'Coast Guard',
  'Other'
] as const;

// Web Link Types
export const WEB_LINK_TYPES = [
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin', placeholder: 'https://linkedin.com/in/username' },
  { value: 'twitter', label: 'Twitter/X', icon: 'twitter', placeholder: 'https://twitter.com/username' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube', placeholder: 'https://youtube.com/@channel' },
  { value: 'github', label: 'GitHub', icon: 'github', placeholder: 'https://github.com/username' },
  { value: 'website', label: 'Website', icon: 'globe', placeholder: 'https://yourwebsite.com' }
] as const;

// Validation Functions
export const validateWebLink = (link: WebLink): { isValid: boolean; error?: string } => {
  if (!link.url || link.url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
    return { isValid: false, error: 'URL must start with http:// or https://' };
  }

  // Platform-specific validation
  switch (link.type) {
    case 'linkedin':
      if (!link.url.includes('linkedin.com')) {
        return { isValid: false, error: 'Invalid LinkedIn URL' };
      }
      break;
    case 'twitter':
      if (!link.url.includes('twitter.com') && !link.url.includes('x.com')) {
        return { isValid: false, error: 'Invalid Twitter/X URL' };
      }
      break;
    case 'youtube':
      if (!link.url.includes('youtube.com')) {
        return { isValid: false, error: 'Invalid YouTube URL' };
      }
      break;
    case 'github':
      if (!link.url.includes('github.com')) {
        return { isValid: false, error: 'Invalid GitHub URL' };
      }
      break;
    case 'website':
      // Website URLs are more flexible
      break;
  }

  return { isValid: true };
};

export const validateBio = (bio: string): { isValid: boolean; error?: string } => {
  if (bio.length > 600) {
    return { isValid: false, error: 'Bio must be 600 characters or less' };
  }
  return { isValid: true };
};

export const validateLocation = (location: string): { isValid: boolean; error?: string } => {
  if (location.length > 100) {
    return { isValid: false, error: 'Location must be 100 characters or less' };
  }
  return { isValid: true };
};

// Google Places Types
export interface GooglePlace {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export interface GooglePlacesResponse {
  predictions: GooglePlace[];
  status: string;
}

// Location Parsing Functions
export const parseLocationString = (locationString: string): LocationStructured => {
  const parts = locationString.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    return {
      city: parts[0],
      country: parts[1],
      full: locationString
    };
  } else if (parts.length === 1) {
    return {
      city: parts[0],
      country: '',
      full: locationString
    };
  }
  
  return {
    city: '',
    country: '',
    full: locationString
  };
};

export const formatLocationDisplay = (location: LocationStructured): string => {
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  } else if (location.city) {
    return location.city;
  }
  return location.full || '';
};

// Profile Validation
export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateProfileForm = (formData: ProfileFormData): ProfileValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  }

  // Phone validation (optional but if provided, validate format)
  if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  // Bio validation
  const bioValidation = validateBio(formData.bio);
  if (!bioValidation.isValid) {
    errors.bio = bioValidation.error!;
  }

  // Location validation
  const locationValidation = validateLocation(formData.location_current);
  if (!locationValidation.isValid) {
    errors.location_current = locationValidation.error!;
  }

  // Web links validation
  formData.web_links.forEach((link, index) => {
    const linkValidation = validateWebLink(link);
    if (!linkValidation.isValid) {
      errors[`web_links.${index}`] = linkValidation.error!;
    }
  });

  // Preferred locations validation
  formData.locations_preferred.forEach((location, index) => {
    const locationValidation = validateLocation(location);
    if (!locationValidation.isValid) {
      errors[`locations_preferred.${index}`] = locationValidation.error!;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Default Profile Form Data
export const getDefaultProfileFormData = (): ProfileFormData => ({
  name: '',
  phone: '',
  military_rank: '',
  service_branch: '',
  years_experience: '',
  bio: '',
  location_current: '',
  locations_preferred: [],
  web_links: []
});

// Profile Update Types
export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  military_rank?: string;
  service_branch?: string;
  years_experience?: number;
  bio?: string;
  location_current?: string;
  location_current_city?: string;
  location_current_country?: string;
  locations_preferred?: string[];
  locations_preferred_structured?: LocationStructured[];
  web_links?: WebLink[];
}

// API Response Types
export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  profile?: EnhancedVeteranProfile;
  errors?: Record<string, string>;
}

export interface ProfileFetchResponse {
  success: boolean;
  profile?: EnhancedVeteranProfile;
  error?: string;
}
