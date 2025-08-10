import { getServerSupabase } from '@/lib/supabaseClient'
import { many } from '@/lib/db'
import { getReferralFunnel, getPlatformBreakdown, getTopReferrers } from '@/lib/referralEvents'

export interface VeteranMetrics {
  pitch: {
    id: string
    title: string
    plan_tier: string
    plan_expires_at: string
    is_active: boolean
    status: string
  } | null
  endorsements: {
    total: number
    recent: Array<{
      id: string
      endorser_name: string
      message: string
      created_at: string
    }>
  }
  referrals: {
    last7d: {
      opens: number
      views: number
      calls: number
      emails: number
    }
    last30d: {
      opens: number
      views: number
      calls: number
      emails: number
    }
    topPlatforms: Array<{
      platform: string
      count: number
    }>
  }
  resumeRequests: Array<{
    id: string
    status: 'pending' | 'approved' | 'declined'
    recruiter_name: string
    message: string
    created_at: string
  }>
}

export interface RecruiterMetrics {
  shortlisted: Array<{
    id: string
    title: string
    veteran_name: string
    skills: string[]
    phone: string
    email: string
  }>
  contacted: Array<{
    id: string
    pitch_title: string
    veteran_name: string
    type: 'call' | 'email'
    created_at: string
  }>
  resumeRequests: Array<{
    id: string
    pitch_title: string
    veteran_name: string
    status: 'pending' | 'approved' | 'declined'
    created_at: string
  }>
  notes: Array<{
    id: string
    pitch_title: string
    veteran_name: string
    text: string
    created_at: string
  }>
}

export interface SupporterMetrics {
  referredPitches: Array<{
    id: string
    title: string
    veteran_name: string
    click_count: number
    last_activity: string
  }>
  eventsByPlatform: Array<{
    platform: string
    views: number
    calls: number
    emails: number
  }>
  conversions: {
    views: number
    calls: number
    emails: number
    conversionRate: number
  }
  endorsements: Array<{
    id: string
    veteran_name: string
    pitch_title: string
    created_at: string
  }>
  topReferrers: Array<{
    referralId: string
    totalEvents: number
    conversions: number
    conversionRate: number
  }>
}

export async function getVeteranMetrics(userId: string): Promise<VeteranMetrics> {
  const supabase = getServerSupabase()
  
  // Get pitch status
  const { data: pitch } = await supabase
    .from('pitches')
    .select('id, title, plan_tier, plan_expires_at, is_active, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get endorsements
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('id, endorser_name, message, created_at')
    .eq('veteran_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get referrals for this veteran's pitch
  const { data: referrals } = await supabase
    .from('referrals')
    .select('id')
    .eq('pitch_id', pitch?.id)

  const referralIds = referrals?.map(r => r.id) || []

  // Get enhanced referral analytics
  const [last7d, last30d, platformBreakdown] = await Promise.all([
    getReferralFunnel(referralIds, 7),
    getReferralFunnel(referralIds, 30),
    getPlatformBreakdown(referralIds, 30)
  ])

  // Get resume requests
  const { data: resumeRequests } = await supabase
    .from('resume_requests')
    .select(`
      id,
      status,
      message,
      created_at,
      profiles!resume_requests_recruiter_id_fkey(full_name)
    `)
    .eq('veteran_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    pitch: pitch || null,
    endorsements: {
      total: endorsements?.length || 0,
      recent: endorsements?.map(e => ({
        id: e.id,
        endorser_name: e.endorser_name,
        message: e.message?.substring(0, 150) + (e.message?.length > 150 ? '...' : ''),
        created_at: e.created_at
      })) || []
    },
    referrals: {
      last7d,
      last30d,
      topPlatforms: platformBreakdown.map(p => ({
        platform: p.platform,
        count: p.views + p.calls + p.emails
      }))
    },
    resumeRequests: resumeRequests?.map(r => ({
      id: r.id,
      status: r.status,
      recruiter_name: r.profiles?.[0]?.full_name || 'Unknown',
      message: r.message || '',
      created_at: r.created_at
    })) || []
  }
}

export async function getRecruiterMetrics(userId: string): Promise<RecruiterMetrics> {
  const supabase = getServerSupabase()
  
  // Get shortlisted pitches
  const { data: shortlisted } = await supabase
    .from('shortlist')
    .select(`
      id,
      pitches!inner(
        id,
        title,
        profiles!inner(full_name, phone, email),
        skills
      )
    `)
    .eq('recruiter_id', userId)

  // Get recent contacts (from activity_log)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: contacts } = await supabase
    .from('activity_log')
    .select('id, event, meta, created_at')
    .eq('user_id', userId)
    .in('event', ['recruiter_called', 'recruiter_emailed'])
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(30)

  // Get resume requests
  const { data: resumeRequests } = await supabase
    .from('resume_requests')
    .select(`
      id,
      status,
      created_at,
      pitches!inner(
        title,
        profiles!inner(full_name)
      )
    `)
    .eq('recruiter_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get notes
  const { data: notes } = await supabase
    .from('recruiter_notes')
    .select(`
      id,
      text,
      created_at,
      pitches!inner(
        title,
        profiles!inner(full_name)
      )
    `)
    .eq('recruiter_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    shortlisted: shortlisted?.map(s => ({
      id: s.pitches?.[0]?.id || '',
      title: s.pitches?.[0]?.title || '',
      veteran_name: s.pitches?.[0]?.profiles?.[0]?.full_name || 'Unknown',
      skills: s.pitches?.[0]?.skills || [],
      phone: s.pitches?.[0]?.profiles?.[0]?.phone || '',
      email: s.pitches?.[0]?.profiles?.[0]?.email || ''
    })) || [],
    contacted: contacts?.map(c => ({
      id: c.id,
      pitch_title: c.meta?.pitch_title || 'Unknown',
      veteran_name: c.meta?.veteran_name || 'Unknown',
      type: c.event === 'recruiter_called' ? 'call' : 'email',
      created_at: c.created_at
    })) || [],
    resumeRequests: resumeRequests?.map(r => ({
      id: r.id,
      pitch_title: r.pitches?.[0]?.title || '',
      veteran_name: r.pitches?.[0]?.profiles?.[0]?.full_name || 'Unknown',
      status: r.status,
      created_at: r.created_at
    })) || [],
    notes: notes?.map(n => ({
      id: n.id,
      pitch_title: n.pitches?.[0]?.title || '',
      veteran_name: n.pitches?.[0]?.profiles?.[0]?.full_name || 'Unknown',
      text: n.text,
      created_at: n.created_at
    })) || []
  }
}

export async function getSupporterMetrics(userId: string): Promise<SupporterMetrics> {
  const supabase = getServerSupabase()
  
  // Get referred pitches
  const { data: referrals } = await supabase
    .from('referrals')
    .select(`
      id,
      created_at,
      pitches!inner(
        id,
        title,
        profiles!inner(full_name)
      )
    `)
    .eq('supporter_id', userId)
    .order('created_at', { ascending: false })

  const referralIds = referrals?.map(r => r.id) || []

  // Get enhanced analytics
  const [platformBreakdown, topReferrers] = await Promise.all([
    getPlatformBreakdown(referralIds, 30),
    getTopReferrers(userId, 30)
  ])

  // Calculate conversions
  const views = platformBreakdown.reduce((sum, p) => sum + p.views, 0)
  const calls = platformBreakdown.reduce((sum, p) => sum + p.calls, 0)
  const emails = platformBreakdown.reduce((sum, p) => sum + p.emails, 0)

  // Get endorsements made
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select(`
      id,
      created_at,
      pitches!inner(
        title,
        profiles!inner(full_name)
      )
    `)
    .eq('supporter_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get click counts for each referral
  const { data: clickCounts } = await supabase
    .from('referral_events')
    .select('referral_id, count')
    .in('referral_id', referralIds)
    .eq('event_type', 'PITCH_VIEWED')

  const clickCountMap = new Map()
  clickCounts?.forEach(click => {
    clickCountMap.set(click.referral_id, click.count)
  })

  return {
    referredPitches: referrals?.map(r => ({
      id: r.pitches?.[0]?.id || '',
      title: r.pitches?.[0]?.title || '',
      veteran_name: r.pitches?.[0]?.profiles?.[0]?.full_name || 'Unknown',
      click_count: clickCountMap.get(r.id) || 0,
      last_activity: r.created_at
    })) || [],
    eventsByPlatform: platformBreakdown,
    conversions: {
      views,
      calls,
      emails,
      conversionRate: views > 0 ? ((calls + emails) / views) * 100 : 0
    },
    endorsements: endorsements?.map(e => ({
      id: e.id,
      veteran_name: e.pitches?.[0]?.profiles?.[0]?.full_name || 'Unknown',
      pitch_title: e.pitches?.[0]?.title || '',
      created_at: e.created_at
    })) || [],
    topReferrers
  }
}
