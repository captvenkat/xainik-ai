// =====================================================
// ENHANCED PROFILE SYSTEM TYPES
// TypeScript definitions for intelligent profile features
// =====================================================

// Web link types
export type WebLinkType = 'linkedin' | 'twitter' | 'youtube' | 'github' | 'website';

// Web link interface
export interface WebLink {
  type: WebLinkType;
  url: string;
  label?: string;
  icon?: string;
}

// Location interface for structured location data
export interface LocationData {
  city: string | null;
  country: string | null;
  full: string;
}

// Military rank options
export type MilitaryRank = 
  | 'General' | 'Lieutenant General' | 'Major General' | 'Brigadier' | 'Colonel' | 'Lieutenant Colonel' | 'Major' | 'Captain' | 'Lieutenant' | 'Second Lieutenant'
  | 'Admiral' | 'Vice Admiral' | 'Rear Admiral' | 'Commodore' | 'Captain' | 'Commander' | 'Lieutenant Commander' | 'Lieutenant' | 'Sub Lieutenant' | 'Acting Sub Lieutenant'
  | 'Air Chief Marshal' | 'Air Marshal' | 'Air Vice Marshal' | 'Air Commodore' | 'Group Captain' | 'Wing Commander' | 'Squadron Leader' | 'Flight Lieutenant' | 'Flying Officer' | 'Pilot Officer'
  | 'Retired' | 'Veteran' | 'Ex-Serviceman';

// Service branch options
export type ServiceBranch = 'Indian Army' | 'Indian Navy' | 'Indian Air Force' | 'Coast Guard' | 'Other';

// Enhanced veteran profile interface
export interface EnhancedVeteranProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  military_rank: MilitaryRank | null;
  service_branch: ServiceBranch | null;
  years_experience: number | null;
  bio: string | null; // Max 600 characters
  location_current_city: string | null;
  location_current_country: string | null;
  location_current: string | null;
  locations_preferred: string[]; // Legacy array format
  locations_preferred_structured: LocationData[]; // New structured format
  web_links: WebLink[]; // JSONB array of web links
  legacy_rank: string | null; // Backward compatibility
  created_at: string;
  updated_at: string;
}

// Form data interface for profile editing
export interface ProfileFormData {
  name: string;
  phone: string;
  military_rank: MilitaryRank | '';
  service_branch: ServiceBranch | '';
  years_experience: string;
  bio: string;
  location_current: string;
  locations_preferred: string[];
  web_links: WebLink[];
}

// Google Places API response interface
export interface GooglePlace {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

// Google Places API response
export interface GooglePlacesResponse {
  predictions: GooglePlace[];
  status: string;
}

// Location autocomplete result
export interface LocationAutocompleteResult {
  place_id: string;
  city: string;
  country: string;
  full_address: string;
  display_text: string;
}

// Profile validation errors
export interface ProfileValidationErrors {
  name?: string;
  phone?: string;
  military_rank?: string;
  service_branch?: string;
  years_experience?: string;
  bio?: string;
  location_current?: string;
  locations_preferred?: string;
  web_links?: string;
}

// Profile update response
export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  profile?: EnhancedVeteranProfile;
  errors?: ProfileValidationErrors;
}

// Web link validation result
export interface WebLinkValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

// Constants
export const MILITARY_RANKS: MilitaryRank[] = [
  // Army Ranks
  'General', 'Lieutenant General', 'Major General', 'Brigadier', 'Colonel', 
  'Lieutenant Colonel', 'Major', 'Captain', 'Lieutenant', 'Second Lieutenant',
  // Navy Ranks
  'Admiral', 'Vice Admiral', 'Rear Admiral', 'Commodore', 'Captain', 
  'Commander', 'Lieutenant Commander', 'Lieutenant', 'Sub Lieutenant', 'Acting Sub Lieutenant',
  // Air Force Ranks
  'Air Chief Marshal', 'Air Marshal', 'Air Vice Marshal', 'Air Commodore', 'Group Captain', 
  'Wing Commander', 'Squadron Leader', 'Flight Lieutenant', 'Flying Officer', 'Pilot Officer',
  // General
  'Retired', 'Veteran', 'Ex-Serviceman'
];

export const SERVICE_BRANCHES: ServiceBranch[] = [
  'Indian Army',
  'Indian Navy', 
  'Indian Air Force',
  'Coast Guard',
  'Other'
];

export const WEB_LINK_TYPES: { type: WebLinkType; label: string; icon: string; placeholder: string }[] = [
  {
    type: 'linkedin',
    label: 'LinkedIn',
    icon: 'linkedin',
    placeholder: 'https://linkedin.com/in/your-profile'
  },
  {
    type: 'twitter',
    label: 'Twitter/X',
    icon: 'twitter',
    placeholder: 'https://twitter.com/your-handle'
  },
  {
    type: 'youtube',
    label: 'YouTube',
    icon: 'youtube',
    placeholder: 'https://youtube.com/@your-channel'
  },
  {
    type: 'github',
    label: 'GitHub',
    icon: 'github',
    placeholder: 'https://github.com/your-username'
  },
  {
    type: 'website',
    label: 'Website',
    icon: 'globe',
    placeholder: 'https://your-website.com'
  }
];

// Validation constants
export const PROFILE_CONSTRAINTS = {
  BIO_MAX_LENGTH: 600,
  LOCATIONS_MAX_COUNT: 3,
  WEB_LINKS_MAX_COUNT: 5,
  YEARS_EXPERIENCE_MIN: 0,
  YEARS_EXPERIENCE_MAX: 50
} as const;

// Utility functions
export const validateBio = (bio: string): boolean => {
  return bio.length <= PROFILE_CONSTRAINTS.BIO_MAX_LENGTH;
};

export const validateWebLink = (link: WebLink): WebLinkValidationResult => {
  const { type, url } = link;
  
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }
  
  // Ensure URL starts with http:// or https://
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  // Validate URL format
  try {
    new URL(normalizedUrl);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
  
  // Validate specific link types
  switch (type) {
    case 'linkedin':
      if (!normalizedUrl.includes('linkedin.com')) {
        return { isValid: false, error: 'Must be a LinkedIn URL' };
      }
      break;
    case 'twitter':
      if (!normalizedUrl.includes('twitter.com') && !normalizedUrl.includes('x.com')) {
        return { isValid: false, error: 'Must be a Twitter/X URL' };
      }
      break;
    case 'youtube':
      if (!normalizedUrl.includes('youtube.com')) {
        return { isValid: false, error: 'Must be a YouTube URL' };
      }
      break;
    case 'github':
      if (!normalizedUrl.includes('github.com')) {
        return { isValid: false, error: 'Must be a GitHub URL' };
      }
      break;
    case 'website':
      // Website URLs are more flexible
      break;
    default:
      return { isValid: false, error: 'Invalid link type' };
  }
  
  return { isValid: true, normalizedUrl };
};

export const validateLocations = (locations: string[]): boolean => {
  return locations.length <= PROFILE_CONSTRAINTS.LOCATIONS_MAX_COUNT;
};

export const validateWebLinks = (links: WebLink[]): boolean => {
  return links.length <= PROFILE_CONSTRAINTS.WEB_LINKS_MAX_COUNT;
};

export const validateYearsExperience = (years: string): boolean => {
  const num = parseInt(years);
  return !isNaN(num) && num >= PROFILE_CONSTRAINTS.YEARS_EXPERIENCE_MIN && num <= PROFILE_CONSTRAINTS.YEARS_EXPERIENCE_MAX;
};

// Format functions for display
export const formatLocationDisplay = (location: LocationData): string => {
  return location.city || location.full;
};

export const formatWebLinkDisplay = (link: WebLink): string => {
  const linkType = WEB_LINK_TYPES.find(lt => lt.type === link.type);
  return link.label || linkType?.label || link.type;
};

export const getWebLinkIcon = (type: WebLinkType): string => {
  const linkType = WEB_LINK_TYPES.find(lt => lt.type === type);
  return linkType?.icon || 'link';
};
