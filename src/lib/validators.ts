import { z } from 'zod'

// LinkedIn URL validation
const LINKEDIN_HOSTNAMES = [
  'linkedin.com',
  'www.linkedin.com',
  'in.linkedin.com'
]

export function validateLinkedInUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return LINKEDIN_HOSTNAMES.includes(urlObj.hostname.toLowerCase()) && 
           urlObj.pathname.includes('/in/')
  } catch {
    return false
  }
}

// Form validation schemas
export const PitchFormSchema = z.object({
  job_type: z.enum([
    'full-time', 'part-time', 'freelance', 'consulting', 
    'hybrid', 'project-based', 'remote', 'on-site'
  ]),
  location_current: z.string().min(1, 'Current location is required'),
  location_preferred: z.array(z.string()).max(3, 'Maximum 3 preferred locations'),
  availability: z.enum(['Immediate', '30 days', '60 days', '90 days']),
  phone: z.string().min(1, 'Phone number is required'),
  photo_url: z.string().optional(),
  title: z.string().max(80, 'Title must be 80 characters or less'),
  pitch: z.string().max(300, 'Pitch must be 300 characters or less'),
  skills: z.array(z.string()).length(3, 'Exactly 3 skills required'),
  linkedin_url: z.string().url().optional(),
  resume_file: z.any().optional(), // File validation handled separately
  manual_summary: z.string().optional()
})

export const PlanSchema = z.enum(['trial_14', 'plan_30', 'plan_60', 'plan_90'])

export const PaymentSchema = z.object({
  plan: PlanSchema,
  amount: z.number().positive(),
  currency: z.literal('INR')
})

// Resume file validation
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a PDF, DOC, or DOCX file' }
  }

  return { valid: true }
}

// Phone number validation (E.164 format)
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

// Location validation (basic city format)
export function validateLocation(location: string): boolean {
  return location.length >= 2 && location.length <= 100
}
