import { findRank, getServiceFromRank } from './indianRanks'

export interface ServiceInfo {
  service_start_date?: string;
  service_end_date?: string;
  years_of_service?: number;
  is_veteran?: boolean;
  retirement_type?: string;
  discharge_reason?: string;
  confidence: 'high' | 'medium' | 'low';
  spans?: Array<{start: number, end: number, label: string}>;
}

export function extractServiceInfo(extractedText: string): ServiceInfo {
  const text = extractedText.toLowerCase();
  const spans: Array<{start: number, end: number, label: string}> = [];
  let confidence: 'high' | 'medium' | 'low' = 'low';
  
  // Look for military rank mentions
  const rankMatches = [];
  const lines = extractedText.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line) {
      const rank = findRank(line);
      if (rank) {
        const start = extractedText.indexOf(line);
        const end = start + line.length;
        spans.push({ start, end, label: `rank_${rank.service}` });
        rankMatches.push(rank);
      }
    }
  }
  
  // Look for service duration patterns
  const durationPatterns = [
    /(\d{1,2})\s*(?:years?|yrs?)\s*(?:of\s+)?(?:service|experience)/i,
    /(?:served|serving)\s+(?:for\s+)?(\d{1,2})\s*(?:years?|yrs?)/i,
    /(\d{1,2})\s*(?:years?|yrs?)\s*(?:in\s+)?(?:army|navy|air\s*force|military)/i,
  ];
  
  let yearsOfService: number | undefined;
  for (const pattern of durationPatterns) {
    const match = extractedText.match(pattern);
    if (match && match[1]) {
      yearsOfService = parseInt(match[1]);
      const start = match.index!;
      const end = start + match[0].length;
      spans.push({ start, end, label: 'duration' });
      break;
    }
  }
  
  // Look for date ranges
  const datePatterns = [
    /(\d{4})\s*(?:to|-)\s*(\d{4})/g,
    /(\d{4})\s*(?:until|till)\s*(\d{4})/g,
    /(\d{4})\s*(?:present|current|now)/gi,
  ];
  
  let serviceStartDate: string | undefined;
  let serviceEndDate: string | undefined;
  
  for (const pattern of datePatterns) {
    const matches = [...extractedText.matchAll(pattern)];
    for (const match of matches) {
      if (!match[1]) continue;
      const startYear = parseInt(match[1]);
      const endYear = match[2] ? parseInt(match[2]) : new Date().getFullYear();
      
      // Validate reasonable date ranges
      if (startYear >= 1950 && startYear <= new Date().getFullYear() && 
          endYear >= startYear && endYear <= new Date().getFullYear()) {
        
        serviceStartDate = `${startYear}-01-01`;
        serviceEndDate = `${endYear}-12-31`;
        
        const start = match.index!;
        const end = start + match[0].length;
        spans.push({ start, end, label: 'date_range' });
        break;
      }
    }
    if (serviceStartDate) break;
  }
  
  // Look for retirement/discharge terms
  const retirementTerms = [
    'retired', 'retirement', 'discharged', 'discharge', 'released', 'release',
    'completed service', 'service completed', 'end of service', 'service ended'
  ];
  
  let retirementType: string | undefined;
  let dischargeReason: string | undefined;
  
  for (const term of retirementTerms) {
    if (text.includes(term)) {
      const start = text.indexOf(term);
      const end = start + term.length;
      spans.push({ start, end, label: 'retirement' });
      
      if (term.includes('retire')) {
        retirementType = 'retirement';
      } else if (term.includes('discharge')) {
        retirementType = 'discharge';
        dischargeReason = 'service_completed';
      } else {
        retirementType = 'release';
      }
      break;
    }
  }
  
  // Determine confidence level
  if (rankMatches.length > 0 && (yearsOfService || serviceStartDate)) {
    confidence = 'high';
  } else if (rankMatches.length > 0 || yearsOfService || serviceStartDate) {
    confidence = 'medium';
  }
  
  // Calculate years of service if we have dates but no explicit duration
  if (!yearsOfService && serviceStartDate && serviceEndDate) {
    const start = new Date(serviceStartDate);
    const end = new Date(serviceEndDate);
    yearsOfService = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }
  
  // Determine if veteran
  const isVeteran: boolean = confidence !== 'low' && (!!retirementType || !!(yearsOfService && yearsOfService >= 1));
  
  return {
    service_start_date: serviceStartDate,
    service_end_date: serviceEndDate,
    years_of_service: yearsOfService,
    is_veteran: isVeteran,
    retirement_type: retirementType,
    discharge_reason: dischargeReason,
    confidence,
    spans: spans.length > 0 ? spans : undefined
  };
}
