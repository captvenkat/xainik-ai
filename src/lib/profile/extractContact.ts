export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin_url?: string;
  location?: string;
  confidence: 'high' | 'medium' | 'low';
  spans?: Array<{start: number, end: number, label: 'email' | 'phone' | 'linkedin' | 'location'}>;
}

export function extractContactInfo(extractedText: string): ContactInfo {
  const spans: Array<{start: number, end: number, label: 'email' | 'phone' | 'linkedin' | 'location'}> = [];
  let confidence: 'high' | 'medium' | 'low' = 'low';
  
  // Extract email addresses
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const emailMatches = [...extractedText.matchAll(emailPattern)];
  const email = emailMatches.length > 0 ? emailMatches[0]?.[0]?.toLowerCase() : undefined;
  
  if (email && emailMatches[0]) {
    const match = emailMatches[0];
    spans.push({ 
      start: match.index!, 
      end: match.index! + match[0].length, 
      label: 'email' 
    });
  }
  
  // Extract phone numbers (India format)
  const phonePattern = /(?:(?:\+91[\s-]?|0)?)([6-9]\d{9})\b/g;
  const phoneMatches = [...extractedText.matchAll(phonePattern)];
  let phone: string | undefined;
  
  if (phoneMatches.length > 0 && phoneMatches[0]) {
    const match = phoneMatches[0];
    const number = match[1];
    
    // Validate it's not a date or part of a longer number
    const context = extractedText.substring(Math.max(0, match.index! - 10), match.index! + match[0].length + 10);
    const isDate = /\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(context);
    const isLongNumber = /\d{12,}/.test(context);
    
    if (!isDate && !isLongNumber) {
      phone = `+91${number}`;
      spans.push({ 
        start: match.index!, 
        end: match.index! + match[0].length, 
        label: 'phone' 
      });
    }
  }
  
  // Extract LinkedIn URLs and handles
  const linkedinUrlPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9\-_%]+)/gi;
  const linkedinHandlePattern = /\blinkedin\s*[:\-]\s*([A-Za-z0-9\-_%]+)\b/gi;
  
  const linkedinUrlMatches = [...extractedText.matchAll(linkedinUrlPattern)];
  const linkedinHandleMatches = [...extractedText.matchAll(linkedinHandlePattern)];
  
  let linkedin_url: string | undefined;
  
  if (linkedinUrlMatches.length > 0 && linkedinUrlMatches[0]) {
    const match = linkedinUrlMatches[0];
    const handle = match[1];
    linkedin_url = `https://www.linkedin.com/in/${handle}`;
    spans.push({ 
      start: match.index!, 
      end: match.index! + match[0].length, 
      label: 'linkedin' 
    });
  } else if (linkedinHandleMatches.length > 0 && linkedinHandleMatches[0]) {
    const match = linkedinHandleMatches[0];
    const handle = match[1];
    linkedin_url = `https://www.linkedin.com/in/${handle}`;
    spans.push({ 
      start: match.index!, 
      end: match.index! + match[0].length, 
      label: 'linkedin' 
    });
  }
  
  // Extract location
  const locationPatterns = [
    /(?:location|current location|based in|presently in|residing in)\s*[:\-]?\s*([^,\n]+)/gi,
    /(?:address|city|state)\s*[:\-]?\s*([^,\n]+)/gi,
  ];
  
  let location: string | undefined;
  
  for (const pattern of locationPatterns) {
    const matches = [...extractedText.matchAll(pattern)];
    if (matches.length > 0 && matches[0] && matches[0][1]) {
      const match = matches[0];
      const locationText = match[1]?.trim();
      
      // Basic validation - should contain city-like words
      if (locationText && locationText.length > 2 && locationText.length < 100) {
        location = locationText;
        spans.push({ 
          start: match.index!, 
          end: match.index! + match[0].length, 
          label: 'location' 
        });
        break;
      }
    }
  }
  
  // If no explicit location found, try to extract from header
  if (!location) {
    const lines = extractedText.split('\n');
    const headerLines = lines.slice(0, 5); // Check first 5 lines
    
    for (const line of headerLines) {
      // Look for city-like patterns
      const cityPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/;
      const match = line.match(cityPattern);
      
      if (match && match[1] && match[2]) {
        const city = match[1];
        const state = match[2];
        
        // Basic validation - exclude common non-location words
        const nonLocationWords = ['name', 'email', 'phone', 'linkedin', 'resume', 'cv', 'profile'];
        if (!nonLocationWords.some(word => city.toLowerCase().includes(word) || state.toLowerCase().includes(word))) {
          location = `${city}, ${state}`;
          const start = line.indexOf(match[0]);
          spans.push({ 
            start: start, 
            end: start + match[0].length, 
            label: 'location' 
          });
          break;
        }
      }
    }
  }
  
  // Determine confidence level
  const foundItems = [email, phone, linkedin_url, location].filter(Boolean).length;
  
  if (foundItems >= 3) {
    confidence = 'high';
  } else if (foundItems >= 2) {
    confidence = 'medium';
  } else if (foundItems >= 1) {
    confidence = 'low';
  }
  
  return {
    email,
    phone,
    linkedin_url,
    location,
    confidence,
    spans: spans.length > 0 ? spans : undefined
  };
}
