// Enhanced Profile System Types
// Comprehensive type definitions for intelligent profile features

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
  military_rank: string;
  service_branch: string;
  years_experience: number;
  bio: string;
  location_current: string;
  location_current_city: string;
  location_current_country: string;
  locations_preferred: string[];
  locations_preferred_structured: LocationStructured[];
  web_links: WebLink[];
  retirement_date?: string;
  created_at: string;
  updated_at: string;
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
  retirement_date: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Military Ranks - Organized by category without duplication
export const MILITARY_RANKS = {
  OFFICERS: [
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
  JCOs: [
    'Subedar Major',
    'Subedar',
    'Naib Subedar'
  ],
  NCOs: [
    'Havildar',
    'Naik',
    'Lance Naik',
    'Sepoy'
  ]
} as const;

export const NAVY_RANKS = {
  OFFICERS: [
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
  JCOs: [
    'Master Chief Petty Officer 1st Class',
    'Master Chief Petty Officer 2nd Class',
    'Chief Petty Officer'
  ],
  NCOs: [
    'Petty Officer',
    'Leading Seaman',
    'Seaman 1st Class',
    'Seaman 2nd Class'
  ]
} as const;

export const AIR_FORCE_RANKS = {
  OFFICERS: [
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
  JCOs: [
    'Master Warrant Officer',
    'Warrant Officer',
    'Junior Warrant Officer'
  ],
  NCOs: [
    'Sergeant',
    'Corporal',
    'Leading Aircraftman',
    'Aircraftman 1st Class',
    'Aircraftman 2nd Class'
  ]
} as const;

export const ALL_MILITARY_RANKS = {
  'Indian Army': MILITARY_RANKS,
  'Indian Navy': NAVY_RANKS,
  'Indian Air Force': AIR_FORCE_RANKS
} as const;

// Service Branch Options
export const SERVICE_BRANCHES = [
  'Indian Army',
  'Indian Navy',
  'Indian Air Force'
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
export function validateWebLink(link: WebLink): string | null {
  if (!link.url || link.url.trim() === '') {
    return 'URL is required';
  }
  
  if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
    return 'URL must start with http:// or https://';
  }
  
  // Type-specific validation
  switch (link.type) {
    case 'linkedin':
      if (!link.url.includes('linkedin.com')) {
        return 'Must be a valid LinkedIn URL';
      }
      break;
    case 'twitter':
      if (!link.url.includes('twitter.com') && !link.url.includes('x.com')) {
        return 'Must be a valid Twitter/X URL';
      }
      break;
    case 'youtube':
      if (!link.url.includes('youtube.com')) {
        return 'Must be a valid YouTube URL';
      }
      break;
    case 'github':
      if (!link.url.includes('github.com')) {
        return 'Must be a valid GitHub URL';
      }
      break;
  }
  
  return null;
}

export function validateBio(bio: string): string | null {
  if (bio.length > 600) {
    return 'Bio must be 600 characters or less';
  }
  return null;
}

export function validateLocation(location: string): string | null {
  if (location && location.length > 100) {
    return 'Location must be 100 characters or less';
  }
  return null;
}

export function validateProfileForm(data: ProfileFormData): ProfileValidationResult {
  const errors: Record<string, string> = {};
  
  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Full name is required';
  }
  
  // Bio validation
  const bioError = validateBio(data.bio);
  if (bioError) {
    errors.bio = bioError;
  }
  
  // Location validation
  const locationError = validateLocation(data.location_current);
  if (locationError) {
    errors.location_current = locationError;
  }
  
  // Web links validation
  if (data.web_links && data.web_links.length > 0) {
    for (let i = 0; i < data.web_links.length; i++) {
      const link = data.web_links[i];
      if (link && link.isActive) {
        const linkError = validateWebLink(link);
        if (linkError) {
          errors[`web_links.${i}`] = linkError;
        }
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Utility Functions
export function parseLocationString(location: string): LocationStructured {
  if (!location || location.trim() === '') {
    return { city: '', country: '', full: '' };
  }
  
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    return {
      city: parts[0] || '',
      country: parts[1] || '',
      full: location
    };
  } else {
    return {
      city: parts[0] || '',
      country: '',
      full: location
    };
  }
}

export function formatLocationDisplay(location: LocationStructured): string {
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  return location.city || location.full || '';
}

export function getDefaultProfileFormData(): ProfileFormData {
  return {
    name: '',
    phone: '',
    military_rank: '',
    service_branch: '',
    years_experience: '',
    bio: '',
    location_current: '',
    locations_preferred: [],
    web_links: [],
    retirement_date: ''
  };
}

// Retirement Date Calculation Functions
export function calculateRetirementStatus(retirementDate: string): {
  status: 'retired' | 'active' | 'upcoming';
  timeAgo: string;
  timeUntil: string;
} {
  if (!retirementDate) {
    return { status: 'active', timeAgo: '', timeUntil: '' };
  }
  
  const retirement = new Date(retirementDate);
  const now = new Date();
  const diffTime = retirement.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    // Retired
    const yearsAgo = Math.abs(Math.floor(diffDays / 365));
    const monthsAgo = Math.abs(Math.floor((diffDays % 365) / 30));
    
    let timeAgo = '';
    if (yearsAgo > 0) {
      timeAgo = `${yearsAgo} year${yearsAgo > 1 ? 's' : ''}`;
      if (monthsAgo > 0) {
        timeAgo += ` ${monthsAgo} month${monthsAgo > 1 ? 's' : ''}`;
      }
    } else {
      timeAgo = `${monthsAgo} month${monthsAgo > 1 ? 's' : ''}`;
    }
    
    return { status: 'retired', timeAgo, timeUntil: '' };
  } else if (diffDays > 0) {
    // Upcoming retirement
    const yearsUntil = Math.floor(diffDays / 365);
    const monthsUntil = Math.floor((diffDays % 365) / 30);
    
    let timeUntil = '';
    if (yearsUntil > 0) {
      timeUntil = `${yearsUntil} year${yearsUntil > 1 ? 's' : ''}`;
      if (monthsUntil > 0) {
        timeUntil += ` ${monthsUntil} month${monthsUntil > 1 ? 's' : ''}`;
      }
    } else {
      timeUntil = `${monthsUntil} month${monthsUntil > 1 ? 's' : ''}`;
    }
    
    return { status: 'upcoming', timeAgo: '', timeUntil };
  } else {
    // Retiring today
    return { status: 'upcoming', timeAgo: '', timeUntil: 'today' };
  }
}

export function formatRetirementDisplay(retirementDate: string): string {
  const status = calculateRetirementStatus(retirementDate);
  
  switch (status.status) {
    case 'retired':
      return `Retired ${status.timeAgo} ago`;
    case 'upcoming':
      return `Retiring in ${status.timeUntil}`;
    case 'active':
      return 'Active Service';
    default:
      return 'Active Service';
  }
}
