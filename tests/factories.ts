import { getServerSupabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

// Environment guard to prevent accidental prod data modification
if (process.env.NODE_ENV !== 'test') {
  throw new Error('Test factories can only be used in test environment')
}

// Check if we have test environment variables, otherwise use mock mode
const hasTestEnv = process.env.TEST_SUPABASE_URL && 
                   process.env.TEST_SUPABASE_SERVICE_ROLE_KEY && 
                   process.env.TEST_SUPABASE_ANON_KEY

if (!hasTestEnv) {
  console.warn('Test environment variables not found. Running in mock mode.')
}

// Test database client with service role key
const getTestSupabase = () => {
  if (!hasTestEnv) {
    // Return mock client for testing without database
    return {
      from: (table: string) => ({
        insert: async (data: any) => ({ data, error: null }),
        delete: () => ({
          eq: () => ({ delete: async () => ({ data: null, error: null }) }),
          neq: () => ({ delete: async () => ({ data: null, error: null }) })
        }),
        eq: () => ({ delete: async () => ({ data: null, error: null }) }),
        neq: () => ({ delete: async () => ({ data: null, error: null }) })
      })
    }
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Factory interfaces
export interface TestVeteran {
  id: string
  email: string
  name: string
  phone: string
}

export interface TestPitch {
  id: string
  veteranId: string
  title: string
  pitchText: string
  skills: string[]
  jobType: string
  location: string
  availability: string
  phone: string
}

export interface TestReferral {
  id: string
  supporterId: string
  pitchId: string
  shareLink: string
}

export interface TestReferralEvent {
  id: string
  referralId: string
  eventType: 'LINK_OPENED' | 'PITCH_VIEWED' | 'CALL_CLICKED' | 'EMAIL_CLICKED' | 'SHARE_RESHARED' | 'SIGNUP_FROM_REFERRAL'
  platform?: string
  occurredAt: Date
}

export interface TestEndorsement {
  id: string
  veteranId: string
  endorserId: string
  text?: string
}

export interface TestResumeRequest {
  id: string
  veteranId: string
  recruiterId: string
  message: string
  status: 'pending' | 'approved' | 'declined'
}

// Factory functions
export async function seedVeteranWithPitch(): Promise<{ veteranId: string; pitchId: string }> {
  const supabase = getTestSupabase()
  
  // Create test user
  const veteranId = uuidv4()
  const userData = {
    id: veteranId,
    email: `test-veteran-${Date.now()}@example.com`,
    name: `Test Veteran ${Date.now()}`,
    phone: '+1234567890',
    role: 'veteran' as const
  }
  
  await supabase.from('users').insert(userData)
  
  // Create veteran profile
  await supabase.from('veterans').insert({
    user_id: veteranId,
    rank: 'Sergeant',
    service_branch: 'Army',
    years_experience: 5,
    location_current: 'New York, USA',
    locations_preferred: ['New York, USA', 'Los Angeles, USA']
  })
  
  // Create pitch
  const pitchId = uuidv4()
  const pitchData = {
    id: pitchId,
    veteran_id: veteranId,
    title: `Test Pitch ${Date.now()}`,
    pitch_text: 'Experienced veteran seeking opportunities in technology sector.',
    skills: ['Leadership', 'Problem Solving', 'Team Management'],
    job_type: 'full-time',
    location: 'New York, USA',
    availability: 'Immediate',
    phone: '+1234567890',
    is_active: true,
    plan_tier: 'plan_30',
    plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  await supabase.from('pitches').insert(pitchData)
  
  return { veteranId, pitchId }
}

export async function seedSupporter(): Promise<{ supporterId: string }> {
  const supabase = getTestSupabase()
  
  const supporterId = uuidv4()
  const userData = {
    id: supporterId,
    email: `test-supporter-${Date.now()}@example.com`,
    name: `Test Supporter ${Date.now()}`,
    phone: '+1234567891',
    role: 'supporter' as const
  }
  
  await supabase.from('users').insert(userData)
  
  await supabase.from('supporters').insert({
    user_id: supporterId,
    intro: 'Supporting veterans in their career transition'
  })
  
  return { supporterId }
}

export async function seedRecruiter(): Promise<{ recruiterId: string }> {
  const supabase = getTestSupabase()
  
  const recruiterId = uuidv4()
  const userData = {
    id: recruiterId,
    email: `test-recruiter-${Date.now()}@example.com`,
    name: `Test Recruiter ${Date.now()}`,
    phone: '+1234567892',
    role: 'recruiter' as const
  }
  
  await supabase.from('users').insert(userData)
  
  await supabase.from('recruiters').insert({
    user_id: recruiterId,
    company_name: 'Test Company',
    industry: 'Technology'
  })
  
  return { recruiterId }
}

export async function seedReferral({ 
  pitchId, 
  platform 
}: { 
  pitchId: string; 
  platform?: string 
}): Promise<{ referralId: string }> {
  const supabase = getTestSupabase()
  
  // Create supporter if not exists
  const { supporterId } = await seedSupporter()
  
  const referralId = uuidv4()
  const referralData = {
    id: referralId,
    supporter_id: supporterId,
    pitch_id: pitchId,
    share_link: `https://xainik.com/pitch/${pitchId}?ref=${referralId}`
  }
  
  await supabase.from('referrals').insert(referralData)
  
  return { referralId }
}

export async function recordEvent({ 
  referralId, 
  type, 
  occurredAt = new Date(),
  platform
}: { 
  referralId: string; 
  type: TestReferralEvent['eventType']; 
  occurredAt?: Date;
  platform?: string;
}): Promise<{ eventId: string }> {
  const supabase = getTestSupabase()
  
  const eventId = uuidv4()
  const eventData = {
    id: eventId,
    referral_id: referralId,
    event_type: type,
    platform,
    user_agent: 'Mozilla/5.0 (Test Browser)',
    country: 'US',
    ip_hash: 'test-ip-hash',
    occurred_at: occurredAt.toISOString()
  }
  
  await supabase.from('referral_events').insert(eventData)
  
  return { eventId }
}

export async function endorse({ 
  veteranId, 
  text = 'Highly recommended veteran with excellent skills.'
}: { 
  veteranId: string; 
  text?: string;
}): Promise<{ endorsementId: string }> {
  const supabase = getTestSupabase()
  
  // Create endorser if not exists
  const { recruiterId } = await seedRecruiter()
  
  const endorsementId = uuidv4()
  const endorsementData = {
    id: endorsementId,
    veteran_id: veteranId,
    endorser_id: recruiterId,
    text
  }
  
  await supabase.from('endorsements').insert(endorsementData)
  
  return { endorsementId }
}

export async function resumeRequest({ 
  veteranId, 
  message = 'Interested in discussing opportunities with this veteran.'
}: { 
  veteranId: string; 
  message?: string;
}): Promise<{ requestId: string }> {
  const supabase = getTestSupabase()
  
  // Create recruiter if not exists
  const { recruiterId } = await seedRecruiter()
  
  const requestId = uuidv4()
  const requestData = {
    id: requestId,
    veteran_id: veteranId,
    recruiter_id: recruiterId,
    message,
    status: 'pending' as const
  }
  
  await supabase.from('resume_requests').insert(requestData)
  
  return { requestId }
}

// Cleanup helper
export async function cleanupTestData(): Promise<void> {
  const supabase = getTestSupabase()
  
  // Delete in reverse dependency order
  await supabase.from('referral_events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('referrals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('resume_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('endorsements').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('pitches').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('veterans').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('recruiters').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('supporters').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}
