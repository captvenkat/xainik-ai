export interface Plan {
  id: string
  name: string
  price: number
  duration: number // days
  description: string
  features: string[]
}

export const PLANS: Record<string, Plan> = {
  trial_14: {
    id: 'trial_14',
    name: '14-Day Trial',
    price: 1,
    duration: 14,
    description: 'Perfect for testing the platform',
    features: [
      'Full pitch visibility',
      'Recruiter contact',
      'Analytics dashboard',
      'Email support'
    ]
  },
  plan_7: {
    id: 'plan_7',
    name: '7-Day Plan',
    price: 99,
    duration: 7,
    description: 'Quick visibility boost',
    features: [
      'Full pitch visibility',
      'Recruiter contact',
      'Analytics dashboard',
      'Email support'
    ]
  },
  plan_30: {
    id: 'plan_30',
    name: '30-Day Plan',
    price: 499,
    duration: 30,
    description: 'Standard monthly visibility',
    features: [
      'Full pitch visibility',
      'Recruiter contact',
      'Analytics dashboard',
      'Priority support',
      'Resume request feature'
    ]
  },
  plan_60: {
    id: 'plan_60',
    name: '60-Day Plan',
    price: 899,
    duration: 60,
    description: 'Most popular choice',
    features: [
      'Full pitch visibility',
      'Recruiter contact',
      'Analytics dashboard',
      'Priority support',
      'Resume request feature',
      'Featured placement'
    ]
  },
  plan_90: {
    id: 'plan_90',
    name: '90-Day Plan',
    price: 999,
    duration: 90,
    description: 'Best value for extended visibility',
    features: [
      'Full pitch visibility',
      'Recruiter contact',
      'Analytics dashboard',
      'Priority support',
      'Resume request feature',
      'Featured placement',
      'Direct messaging'
    ]
  }
}

export function getPlanById(planId: string): Plan | null {
  return PLANS[planId] || null
}

export function calculateExpiryDate(planId: string): Date {
  const plan = getPlanById(planId)
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`)
  }

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + plan.duration)
  return expiryDate
}

export function canUseTrial(userId: string, existingPitches: any[]): boolean {
  // Check if user has any existing pitches with trial or paid plans
  const hasUsedTrial = existingPitches.some(pitch => 
    pitch.plan_tier === 'trial_14' || 
    pitch.plan_tier === 'plan_30' || 
    pitch.plan_tier === 'plan_60' || 
    pitch.plan_tier === 'plan_90'
  )
  
  return !hasUsedTrial
}

export function formatPrice(amount: number): string {
  return `₹${amount}`
}

export function getPlanDisplayName(planId: string): string {
  const plan = getPlanById(planId)
  return plan ? plan.name : 'Unknown Plan'
}
