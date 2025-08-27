// Indian Military Ranks Dictionary
// Excludes honorary ranks, includes abbreviations

export interface RankInfo {
  full: string;
  abbreviation: string;
  service: 'army' | 'navy' | 'airforce';
  category: 'officer' | 'jco' | 'nco' | 'other';
  seniority: number; // Lower number = higher rank
}

export const INDIAN_ARMY_RANKS: RankInfo[] = [
  // Officers
  { full: 'Field Marshal', abbreviation: 'FM', service: 'army', category: 'officer', seniority: 1 },
  { full: 'General', abbreviation: 'Gen', service: 'army', category: 'officer', seniority: 2 },
  { full: 'Lieutenant General', abbreviation: 'Lt Gen', service: 'army', category: 'officer', seniority: 3 },
  { full: 'Major General', abbreviation: 'Maj Gen', service: 'army', category: 'officer', seniority: 4 },
  { full: 'Brigadier', abbreviation: 'Brig', service: 'army', category: 'officer', seniority: 5 },
  { full: 'Colonel', abbreviation: 'Col', service: 'army', category: 'officer', seniority: 6 },
  { full: 'Lieutenant Colonel', abbreviation: 'Lt Col', service: 'army', category: 'officer', seniority: 7 },
  { full: 'Major', abbreviation: 'Maj', service: 'army', category: 'officer', seniority: 8 },
  { full: 'Captain', abbreviation: 'Capt', service: 'army', category: 'officer', seniority: 9 },
  { full: 'Lieutenant', abbreviation: 'Lt', service: 'army', category: 'officer', seniority: 10 },
  { full: 'Second Lieutenant', abbreviation: '2Lt', service: 'army', category: 'officer', seniority: 11 },
  
  // JCOs
  { full: 'Subedar Major', abbreviation: 'Sub Maj', service: 'army', category: 'jco', seniority: 12 },
  { full: 'Subedar', abbreviation: 'Sub', service: 'army', category: 'jco', seniority: 13 },
  { full: 'Naib Subedar', abbreviation: 'Nb Sub', service: 'army', category: 'jco', seniority: 14 },
  
  // NCOs
  { full: 'Havildar', abbreviation: 'Hav', service: 'army', category: 'nco', seniority: 15 },
  { full: 'Naik', abbreviation: 'Naik', service: 'army', category: 'nco', seniority: 16 },
  { full: 'Lance Naik', abbreviation: 'L/Nk', service: 'army', category: 'nco', seniority: 17 },
  
  // Other Ranks
  { full: 'Sepoy', abbreviation: 'Sep', service: 'army', category: 'other', seniority: 18 },
];

export const INDIAN_NAVY_RANKS: RankInfo[] = [
  // Officers
  { full: 'Admiral of the Fleet', abbreviation: 'AF', service: 'navy', category: 'officer', seniority: 1 },
  { full: 'Admiral', abbreviation: 'Adm', service: 'navy', category: 'officer', seniority: 2 },
  { full: 'Vice Admiral', abbreviation: 'VAdm', service: 'navy', category: 'officer', seniority: 3 },
  { full: 'Rear Admiral', abbreviation: 'RAdm', service: 'navy', category: 'officer', seniority: 4 },
  { full: 'Commodore', abbreviation: 'Cdre', service: 'navy', category: 'officer', seniority: 5 },
  { full: 'Captain', abbreviation: 'Capt', service: 'navy', category: 'officer', seniority: 6 },
  { full: 'Commander', abbreviation: 'Cdr', service: 'navy', category: 'officer', seniority: 7 },
  { full: 'Lieutenant Commander', abbreviation: 'Lt Cdr', service: 'navy', category: 'officer', seniority: 8 },
  { full: 'Lieutenant', abbreviation: 'Lt', service: 'navy', category: 'officer', seniority: 9 },
  { full: 'Sub Lieutenant', abbreviation: 'Sub Lt', service: 'navy', category: 'officer', seniority: 10 },
  { full: 'Acting Sub Lieutenant', abbreviation: 'Acting Sub Lt', service: 'navy', category: 'officer', seniority: 11 },
  
  // JCOs
  { full: 'Master Chief Petty Officer', abbreviation: 'MCPO', service: 'navy', category: 'jco', seniority: 12 },
  { full: 'Chief Petty Officer', abbreviation: 'CPO', service: 'navy', category: 'jco', seniority: 13 },
  
  // NCOs
  { full: 'Petty Officer', abbreviation: 'PO', service: 'navy', category: 'nco', seniority: 14 },
  { full: 'Leading Seaman', abbreviation: 'LS', service: 'navy', category: 'nco', seniority: 15 },
  
  // Other Ranks
  { full: 'Seaman', abbreviation: 'SMN', service: 'navy', category: 'other', seniority: 16 },
];

export const INDIAN_AIRFORCE_RANKS: RankInfo[] = [
  // Officers
  { full: 'Marshal of the Indian Air Force', abbreviation: 'MIAF', service: 'airforce', category: 'officer', seniority: 1 },
  { full: 'Air Chief Marshal', abbreviation: 'ACM', service: 'airforce', category: 'officer', seniority: 2 },
  { full: 'Air Marshal', abbreviation: 'AM', service: 'airforce', category: 'officer', seniority: 3 },
  { full: 'Air Vice Marshal', abbreviation: 'AVM', service: 'airforce', category: 'officer', seniority: 4 },
  { full: 'Air Commodore', abbreviation: 'Air Cmde', service: 'airforce', category: 'officer', seniority: 5 },
  { full: 'Group Captain', abbreviation: 'Gp Capt', service: 'airforce', category: 'officer', seniority: 6 },
  { full: 'Wing Commander', abbreviation: 'Wg Cdr', service: 'airforce', category: 'officer', seniority: 7 },
  { full: 'Squadron Leader', abbreviation: 'Sqn Ldr', service: 'airforce', category: 'officer', seniority: 8 },
  { full: 'Flight Lieutenant', abbreviation: 'Flt Lt', service: 'airforce', category: 'officer', seniority: 9 },
  { full: 'Flying Officer', abbreviation: 'Fg Offr', service: 'airforce', category: 'officer', seniority: 10 },
  { full: 'Pilot Officer', abbreviation: 'Plt Offr', service: 'airforce', category: 'officer', seniority: 11 },
  
  // JCOs
  { full: 'Master Warrant Officer', abbreviation: 'MWO', service: 'airforce', category: 'jco', seniority: 12 },
  { full: 'Warrant Officer', abbreviation: 'WO', service: 'airforce', category: 'jco', seniority: 13 },
  
  // NCOs
  { full: 'Junior Warrant Officer', abbreviation: 'JWO', service: 'airforce', category: 'nco', seniority: 14 },
  { full: 'Sergeant', abbreviation: 'Sgt', service: 'airforce', category: 'nco', seniority: 15 },
  { full: 'Corporal', abbreviation: 'Cpl', service: 'airforce', category: 'nco', seniority: 16 },
  { full: 'Leading Aircraftman', abbreviation: 'LAC', service: 'airforce', category: 'nco', seniority: 17 },
  
  // Other Ranks
  { full: 'Aircraftman', abbreviation: 'AC', service: 'airforce', category: 'other', seniority: 18 },
];

export const ALL_RANKS = [...INDIAN_ARMY_RANKS, ...INDIAN_NAVY_RANKS, ...INDIAN_AIRFORCE_RANKS];

export function findRank(text: string): RankInfo | null {
  const normalizedText = text.toLowerCase().trim();
  
  // Check full names first
  for (const rank of ALL_RANKS) {
    if (normalizedText.includes(rank.full.toLowerCase())) {
      return rank;
    }
  }
  
  // Check abbreviations
  for (const rank of ALL_RANKS) {
    if (normalizedText.includes(rank.abbreviation.toLowerCase())) {
      return rank;
    }
  }
  
  return null;
}

export function getServiceFromRank(rank: RankInfo): string {
  switch (rank.service) {
    case 'army': return 'Indian Army';
    case 'navy': return 'Indian Navy';
    case 'airforce': return 'Indian Air Force';
    default: return 'Indian Armed Forces';
  }
}

export function translateMilitaryToCorporate(rank: RankInfo): string {
  const seniority = rank.seniority;
  
  if (seniority <= 5) return 'Senior Executive';
  if (seniority <= 8) return 'Manager';
  if (seniority <= 11) return 'Team Lead';
  if (seniority <= 14) return 'Senior Specialist';
  if (seniority <= 16) return 'Specialist';
  return 'Professional';
}
