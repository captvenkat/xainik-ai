import { getServerSupabase } from '@/lib/supabaseClient'
import { many } from '@/lib/db'
import { getReferralFunnel, getPlatformBreakdown, getTopReferrers } from '@/lib/referralEvents'

// Enhanced analytics interfaces
export interface TrendlineData {
  date: string
  value: number
  label: string
}

export interface CohortConversionData {
  source: string
  totalReferrals: number
  views: number
  calls: number
  emails: number
  viewRate: number
  conversionRate: number
  avgTimeToFirstContact: number // in hours
  trend: 'up' | 'down' | 'stable'
  improvement: number // percentage improvement vs previous period
}

export interface AnalyticsMetrics {
  trendlines: {
    views: TrendlineData[]
    calls: TrendlineData[]
    emails: TrendlineData[]
    endorsements: TrendlineData[]
  }
  cohortConversions: CohortConversionData[]
  performanceInsights: {
    lowViews: boolean
    lowConversions: boolean
    suggestions: string[]
    goals: {
      next30Days: string[]
      next90Days: string[]
    }
    benchmarks: {
      industryAvg: number
      topPerformers: number
      yourPerformance: number
    }
  }
  comparativeMetrics: {
    last30d: {
      views: number
      calls: number
      emails: number
      endorsements: number
    }
    last90d: {
      views: number
      calls: number
      emails: number
      endorsements: number
    }
    growth: {
      views: number
      calls: number
      emails: number
      endorsements: number
    }
  }
}

// New types for the requested functions
export type WindowOpt = { 
  window: 30 | 90; 
  veteranId?: string | undefined; 
  recruiterId?: string | undefined; 
};

export type SeriesPoint = { date: string; value: number };
export type Trendline = { label: 'pitch_viewed'|'recruiter_called'|'recruiter_emailed'; points: SeriesPoint[]; window: 30|90 };

export type CohortRow = {
  source: 'whatsapp'|'linkedin'|'email'|'copy'|'other';
  referrals: number;
  opens: number;
  views: number;
  calls: number;
  emails: number;
  conv_view_to_call: number;   // calls / views
  conv_view_to_email: number;  // emails / views
};

export type AvgTime = { hours: number; samples: number };

// Enhanced function: Get trendline data for all pitches with veteran filtering
export async function getTrendlineAllPitches(opt: WindowOpt): Promise<Trendline[]> {
  const supabase = getServerSupabase();
  const since = new Date();
  since.setDate(since.getDate() - opt.window);

  // Build query based on data source preference
  let query = supabase
    .from('referral_events')
    .select('event_type, occurred_at, referral_id')
    .gte('occurred_at', since.toISOString());

  // If veteranId is provided, filter to that veteran's pitches
  if (opt.veteranId) {
    query = query.eq('referral_id', opt.veteranId);
  }

  const { data: referralData, error: referralError } = await query;
  if (referralError) throw referralError;

  // Fallback to activity_log if referral_events doesn't have enough data
  let activityData: any[] = [];
  if (!referralData || referralData.length === 0) {
    const { data: actData, error: actError } = await supabase
      .from('activity_log')
      .select('event, created_at')
      .gte('created_at', since.toISOString());
    if (actError) throw actError;
    activityData = actData || [];
  }

  // Bucket by date+event
  const bucket = new Map<string, number>();
  const asKey = (d: string, e: string) => `${d}|${e}`;

  // Process referral_events data
  for (const r of referralData ?? []) {
    const d = (r.occurred_at as string).slice(0, 10);
    let eventType = r.event_type as string;
    
    // Map referral_events to trendline labels
    switch (eventType) {
      case 'PITCH_VIEWED':
        eventType = 'pitch_viewed';
        break;
      case 'CALL_CLICKED':
        eventType = 'recruiter_called';
        break;
      case 'EMAIL_CLICKED':
        eventType = 'recruiter_emailed';
        break;
      default:
        continue; // Skip other event types
    }
    
    const k = asKey(d, eventType);
    bucket.set(k, (bucket.get(k) ?? 0) + 1);
  }

  // Process activity_log fallback data
  for (const r of activityData) {
    const d = (r.created_at as string).slice(0, 10);
    let eventType = r.event as string;
    
    // Map activity_log events to trendline labels
    switch (eventType) {
      case 'pitch_viewed':
        eventType = 'pitch_viewed';
        break;
      case 'recruiter_called':
        eventType = 'recruiter_called';
        break;
      case 'recruiter_emailed':
        eventType = 'recruiter_emailed';
        break;
      default:
        continue; // Skip other event types
    }
    
    const k = asKey(d, eventType);
    bucket.set(k, (bucket.get(k) ?? 0) + 1);
  }

  const toSeries = (label: Trendline['label']) => {
    const points: SeriesPoint[] = [];
    for (let i = opt.window - 1; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const day = dt.toISOString().slice(0, 10);
      const val = bucket.get(asKey(day, label)) ?? 0;
      points.push({ date: day, value: val });
    }
    return { label, points, window: opt.window };
  };

  return [
    toSeries('pitch_viewed'),
    toSeries('recruiter_called'),
    toSeries('recruiter_emailed'),
  ];
}

// Enhanced function: Get cohort conversions by source with veteran filtering
export async function getCohortsBySource(opt: WindowOpt): Promise<CohortRow[]> {
  const supabase = getServerSupabase();
  const since = new Date();
  since.setDate(since.getDate() - opt.window);

  // Build query for referral events with platform information
  let query = supabase
    .from('referral_events')
    .select('event_type, platform, occurred_at, referral_id')
    .gte('occurred_at', since.toISOString());

  // If veteranId is provided, filter to that veteran's pitches
  if (opt.veteranId) {
    query = query.eq('referral_id', opt.veteranId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = new Map<string, CohortRow>();
  const norm = (p?: string|null) => {
    const platform = p?.toLowerCase();
    // Normalize unknown platforms to 'other'
    if (!platform || !['whatsapp', 'linkedin', 'email', 'copy'].includes(platform)) {
      return 'other';
    }
    return platform as CohortRow['source'];
  };

  for (const r of data ?? []) {
    const src = norm(r.platform);
    if (!rows.has(src)) {
      rows.set(src, { 
        source: src, 
        referrals: 0, 
        opens: 0, 
        views: 0, 
        calls: 0, 
        emails: 0, 
        conv_view_to_call: 0, 
        conv_view_to_email: 0 
      });
    }
    const row = rows.get(src)!;
    switch (r.event_type) {
      case 'LINK_OPENED': row.opens++; break;
      case 'PITCH_VIEWED': row.views++; break;
      case 'CALL_CLICKED': row.calls++; break;
      case 'EMAIL_CLICKED': row.emails++; break;
    }
  }

  // Calculate referrals and conversions with safe division
  for (const row of rows.values()) {
    row.referrals = Math.max(row.referrals, row.opens); // fallback
    row.conv_view_to_call = row.views > 0 ? +(row.calls / row.views).toFixed(3) : 0;
    row.conv_view_to_email = row.views > 0 ? +(row.emails / row.views).toFixed(3) : 0;
  }
  
  return Array.from(rows.values()).sort((a, b) => (b.calls + b.emails) - (a.calls + a.emails));
}

// Enhanced function: Get average time to first contact with veteran filtering
export async function getAvgTimeToFirstContact(opt: WindowOpt): Promise<AvgTime> {
  const supabase = getServerSupabase();
  const since = new Date();
  since.setDate(since.getDate() - opt.window);

  // Build query for referral events (preferred data source)
  let query = supabase
    .from('referral_events')
    .select('event_type, occurred_at, referral_id')
    .gte('occurred_at', since.toISOString())
    .in('event_type', ['PITCH_VIEWED', 'CALL_CLICKED', 'EMAIL_CLICKED']);

  // If veteranId is provided, filter to that veteran's pitches
  if (opt.veteranId) {
    query = query.eq('referral_id', opt.veteranId);
  }

  const { data: referralData, error: referralError } = await query;
  if (referralError) throw referralError;

  // Fallback to activity_log if referral_events doesn't have enough data
  let activityData: any[] = [];
  if (!referralData || referralData.length === 0) {
    const { data: actData, error: actError } = await supabase
      .from('activity_log')
      .select('event, created_at, meta')
      .gte('created_at', since.toISOString())
      .in('event', ['pitch_viewed', 'recruiter_called', 'recruiter_emailed']);
    if (actError) throw actError;
    activityData = actData || [];
  }

  // Map pitchId -> { firstView: Date|null, firstContact: Date|null }
  const map = new Map<string, { v?: number; c?: number }>();

  // Process referral_events data
  for (const r of referralData ?? []) {
    const pitchId = r.referral_id as string;
    if (!pitchId) continue;
    
    const t = new Date(r.occurred_at as string).getTime();
    const slot = map.get(pitchId) ?? {};
    
    if (r.event_type === 'PITCH_VIEWED') {
      slot.v = Math.min(slot.v ?? Number.MAX_SAFE_INTEGER, t);
    } else if (r.event_type === 'CALL_CLICKED' || r.event_type === 'EMAIL_CLICKED') {
      slot.c = Math.min(slot.c ?? Number.MAX_SAFE_INTEGER, t);
    }
    map.set(pitchId, slot);
  }

  // Process activity_log fallback data
  for (const r of activityData) {
    const pitchId = (r.meta as any)?.pitch_id as string | undefined;
    if (!pitchId) continue;
    
    const t = new Date(r.created_at as string).getTime();
    const slot = map.get(pitchId) ?? {};
    
    if (r.event === 'pitch_viewed') {
      slot.v = Math.min(slot.v ?? Number.MAX_SAFE_INTEGER, t);
    } else if (r.event === 'recruiter_called' || r.event === 'recruiter_emailed') {
      slot.c = Math.min(slot.c ?? Number.MAX_SAFE_INTEGER, t);
    }
    map.set(pitchId, slot);
  }

  // Calculate time deltas for pitches with both view and contact
  const deltas: number[] = [];
  for (const { v, c } of map.values()) {
    if (v && c && c >= v) {
      deltas.push((c - v) / 36e5); // ms→hours
    }
  }

  const avg = deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;
  return { 
    hours: +avg.toFixed(1), // Round to 1 decimal place as specified
    samples: deltas.length 
  };
}

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
    .eq('veteran_id', userId)
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

// New analytics functions
export async function getTrendlineData(userId: string, days: number = 90): Promise<AnalyticsMetrics['trendlines']> {
  const supabase = getServerSupabase()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  // Get pitch ID for this veteran
  const { data: pitch } = await supabase
    .from('pitches')
    .select('id')
    .eq('veteran_id', userId)
    .single()
  
  if (!pitch) {
    return {
      views: [],
      calls: [],
      emails: [],
      endorsements: []
    }
  }
  
  // Get referral IDs for this pitch
  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, created_at')
    .eq('pitch_id', pitch.id)
    .gte('created_at', startDate.toISOString())
  
  if (!referrals || referrals.length === 0) {
    return {
      views: [],
      calls: [],
      emails: [],
      endorsements: []
    }
  }
  
  const referralIds = referrals.map(r => r.id)
  
  // Get all events for these referrals
  const { data: events } = await supabase
    .from('referral_events')
    .select('referral_id, event_type, created_at')
    .in('referral_id', referralIds)
  
  if (!events) {
    return {
      views: [],
      calls: [],
      emails: [],
      endorsements: []
    }
  }
  
  // Initialize daily data map
  const dailyMap = new Map<string, { views: number; calls: number; emails: number }>()
  const endorsementsMap = new Map<string, number>()
  
  // Initialize all days in range
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)
    dailyMap.set(dateStr, { views: 0, calls: 0, emails: 0 })
    endorsementsMap.set(dateStr, 0)
  }
  
  // Process events
  events.forEach(event => {
    const eventDate = new Date(event.created_at)
    const dateStr = eventDate.toISOString().slice(0, 10)
    
    if (dailyMap.has(dateStr)) {
      const dayData = dailyMap.get(dateStr)!
      switch (event.event_type) {
        case 'PITCH_VIEWED':
          dayData.views++
          break
        case 'CALL_CLICKED':
          dayData.calls++
          break
        case 'EMAIL_CLICKED':
          dayData.emails++
          break
      }
    }
  })
  
  // Process endorsements (from endorsements table)
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('created_at')
    .eq('pitch_id', pitch.id)
    .gte('created_at', startDate.toISOString())
  
  if (endorsements) {
    endorsements.forEach(endorsement => {
      const endorsementDate = new Date(endorsement.created_at)
      const dateStr = endorsementDate.toISOString().slice(0, 10)
      if (endorsementsMap.has(dateStr)) {
        endorsementsMap.set(dateStr, (endorsementsMap.get(dateStr) || 0) + 1)
      }
    })
  }
  
  // Convert to arrays and sort by date
  const sortedDates = Array.from(dailyMap.keys()).sort()
  
  return {
    views: sortedDates.map(date => ({
      date,
      value: dailyMap.get(date)!.views,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })),
    calls: sortedDates.map(date => ({
      date,
      value: dailyMap.get(date)!.calls,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })),
    emails: sortedDates.map(date => ({
      date,
      value: dailyMap.get(date)!.emails,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })),
    endorsements: sortedDates.map(date => ({
      date,
      value: endorsementsMap.get(date) || 0,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
  }
}

export async function getCohortConversions(userId: string, days: number = 90): Promise<CohortConversionData[]> {
  const supabase = getServerSupabase()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  // Get pitch ID for this veteran
  const { data: pitch } = await supabase
    .from('pitches')
    .select('id')
    .eq('veteran_id', userId)
    .single()
  
  if (!pitch) return []
  
  // Get referral IDs for this pitch
  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, created_at')
    .eq('pitch_id', pitch.id)
    .gte('created_at', startDate.toISOString())
  
  if (!referrals || referrals.length === 0) return []
  
  const referralIds = referrals.map(r => r.id)
  
  // Get all events for these referrals
  const { data: events } = await supabase
    .from('referral_events')
    .select('referral_id, event_type, platform, created_at')
    .in('referral_id', referralIds)
  
  if (!events) return []
  
  // Group by platform/source
  const platformMap = new Map<string, {
    referrals: Set<string>
    views: number
    calls: number
    emails: number
    firstContactTimes: number[]
  }>()
  
  events.forEach(event => {
    const platform = event.platform || 'unknown'
    if (!platformMap.has(platform)) {
      platformMap.set(platform, {
        referrals: new Set(),
        views: 0,
        calls: 0,
        emails: 0,
        firstContactTimes: []
      })
    }
    
    const platformData = platformMap.get(platform)!
    platformData.referrals.add(event.referral_id)
    
    switch (event.event_type) {
      case 'PITCH_VIEWED':
        platformData.views++
        break
      case 'CALL_CLICKED':
        platformData.calls++
        platformData.firstContactTimes.push(new Date(event.created_at).getTime())
        break
      case 'EMAIL_CLICKED':
        platformData.emails++
        platformData.firstContactTimes.push(new Date(event.created_at).getTime())
        break
    }
  })
  
  // Calculate cohort conversion data with trend analysis
  return Array.from(platformMap.entries()).map(([source, data]) => {
    const totalReferrals = data.referrals.size
    const totalViews = data.views
    const totalCalls = data.calls
    const totalEmails = data.emails
    
    const viewRate = totalReferrals > 0 ? (totalViews / totalReferrals) * 100 : 0
    const conversionRate = totalViews > 0 ? ((totalCalls + totalEmails) / totalViews) * 100 : 0
    
    // Calculate average time to first contact
    let avgTimeToFirstContact = 0
    if (data.firstContactTimes.length > 0) {
      const referralTimes = referrals
        .filter(r => data.referrals.has(r.id))
        .map(r => new Date(r.created_at).getTime())
      
      const timeDiffs = data.firstContactTimes.map(contactTime => {
        const referralTime = referralTimes.find(rt => rt <= contactTime)
        return referralTime ? (contactTime - referralTime) / (1000 * 60 * 60) : 0 // Convert to hours
      }).filter(diff => diff > 0)
      
      avgTimeToFirstContact = timeDiffs.length > 0 
        ? timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length
        : 0
    }

    // Calculate trend and improvement (simplified - in production, compare with previous period)
    const trend: 'up' | 'down' | 'stable' = conversionRate > 10 ? 'up' : conversionRate > 5 ? 'stable' : 'down'
    const improvement = trend === 'up' ? Math.min(conversionRate * 0.2, 15) : trend === 'stable' ? 0 : -5
    
    return {
      source,
      totalReferrals,
      views: totalViews,
      calls: totalCalls,
      emails: totalEmails,
      viewRate: Math.round(viewRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgTimeToFirstContact: Math.round(avgTimeToFirstContact * 100) / 100,
      trend,
      improvement
    }
  }).sort((a, b) => b.totalReferrals - a.totalReferrals)
}

export async function getPerformanceInsights(userId: string): Promise<AnalyticsMetrics['performanceInsights']> {
  const supabase = getServerSupabase()
  
  // Get pitch data
  const { data: pitch } = await supabase
    .from('pitches')
    .select('id, created_at')
    .eq('veteran_id', userId)
    .single()
  
  if (!pitch) {
    return {
      lowViews: false,
      lowConversions: false,
      suggestions: ['Create your first pitch to start getting insights'],
      goals: {
        next30Days: ['Create your first pitch', 'Ask 3 supporters to share your pitch', 'Set up your profile completely'],
        next90Days: ['Achieve 50+ pitch views', 'Get 5+ endorsements', 'Receive 2+ resume requests']
      },
      benchmarks: {
        industryAvg: 0,
        topPerformers: 0,
        yourPerformance: 0
      }
    }
  }
  
  // Get 30-day metrics
  const trendlines = await getTrendlineData(userId, 30)
  const cohortData = await getCohortConversions(userId, 30)
  
  // Calculate total views and conversions
  const totalViews = trendlines.views.reduce((sum, day) => sum + day.value, 0)
  const totalCalls = trendlines.calls.reduce((sum, day) => sum + day.value, 0)
  const totalEmails = trendlines.emails.reduce((sum, day) => sum + day.value, 0)
  
  const lowViews = totalViews < 10
  const lowConversions = totalViews > 0 && ((totalCalls + totalEmails) / totalViews) < 0.05 // Less than 5% conversion
  
  const suggestions: string[] = []
  
  if (lowViews) {
    suggestions.push('Your pitch visibility is low. Consider asking supporters to share your pitch more actively.')
    suggestions.push('Review your pitch title and skills to ensure they match current market demands.')
  }
  
  if (lowConversions) {
    suggestions.push('Low conversion rate detected. Consider adding more specific contact information.')
    suggestions.push('Review your pitch text to ensure it clearly communicates your value proposition.')
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Great performance! Keep engaging with your network to maintain momentum.')
  }
  
  // Generate actionable goals based on current performance
  const goals = {
    next30Days: [] as string[],
    next90Days: [] as string[]
  }
  
  if (lowViews) {
    goals.next30Days.push('Increase pitch shares by 50%')
    goals.next30Days.push('Optimize pitch title for better visibility')
    goals.next30Days.push('Reach out to 5 new supporters')
  } else {
    goals.next30Days.push('Maintain current view momentum')
    goals.next30Days.push('Focus on conversion optimization')
    goals.next30Days.push('Analyze top-performing referral sources')
  }
  
  if (lowConversions) {
    goals.next30Days.push('Improve pitch call-to-action')
    goals.next30Days.push('Add more specific contact details')
    goals.next30Days.push('Test different pitch formats')
  }
  
  // 90-day strategic goals
  goals.next90Days.push(`Achieve ${Math.max(100, totalViews * 3)} total pitch views`)
  goals.next90Days.push(`Improve conversion rate to ${Math.max(8, ((totalCalls + totalEmails) / Math.max(totalViews, 1)) * 100 + 3)}%`)
  goals.next90Days.push('Build relationships with top-performing referral sources')
  
  // Calculate benchmarks (simplified - in production, these would come from industry data)
  const yourPerformance = totalViews > 0 ? ((totalCalls + totalEmails) / totalViews) * 100 : 0
  const industryAvg = 5.2 // Placeholder - would come from industry data
  const topPerformers = 15.8 // Placeholder - would come from top performer analysis
  
  const benchmarks = {
    industryAvg: Math.round(industryAvg * 100) / 100,
    topPerformers: Math.round(topPerformers * 100) / 100,
    yourPerformance: Math.round(yourPerformance * 100) / 100
  }
  
  return {
    lowViews,
    lowConversions,
    suggestions,
    goals,
    benchmarks
  }
}

export async function getVeteranAnalytics(userId: string): Promise<AnalyticsMetrics> {
  const [trendlines, cohortConversions, performanceInsights, comparativeMetrics] = await Promise.all([
    getTrendlineData(userId),
    getCohortConversions(userId),
    getPerformanceInsights(userId),
    getComparativeMetrics(userId)
  ])
  
  return {
    trendlines,
    cohortConversions,
    performanceInsights,
    comparativeMetrics
  }
}

// New function for recruiter analytics with saved filters and reporting
export async function getRecruiterAnalytics(userId: string) {
  const supabase = getServerSupabase()
  
  // Get recruiter metrics
  const metrics = await getRecruiterMetrics(userId)
  
  // Get saved filters (if they exist in the future)
  const savedFilters: any[] = [] // Placeholder for future implementation
  
  // Get performance trends
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('event, created_at')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })
  
  // Aggregate daily activity
  const dailyActivity = new Map<string, number>()
  recentActivity?.forEach(activity => {
    const date = new Date(activity.created_at).toISOString().slice(0, 10)
    dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1)
  })
  
  const activityTrend = Array.from(dailyActivity.entries()).map(([date, count]) => ({
    date,
    value: count,
    label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))
  
  return {
    metrics,
    savedFilters,
    activityTrend,
    summary: {
      totalShortlisted: metrics.shortlisted.length,
      totalContacted: metrics.contacted.length,
      pendingResumeRequests: metrics.resumeRequests.filter(r => r.status === 'pending').length,
      totalNotes: metrics.notes.length
    }
  }
}

export async function getComparativeMetrics(userId: string): Promise<AnalyticsMetrics['comparativeMetrics']> {
  const supabase = getServerSupabase()
  
  // Get pitch ID for this veteran
  const { data: pitch } = await supabase
    .from('pitches')
    .select('id')
    .eq('veteran_id', userId)
    .single()
  
  if (!pitch) {
    return {
      last30d: { views: 0, calls: 0, emails: 0, endorsements: 0 },
      last90d: { views: 0, calls: 0, emails: 0, endorsements: 0 },
      growth: { views: 0, calls: 0, emails: 0, endorsements: 0 }
    }
  }
  
  // Get 30-day and 90-day data
  const [trendlines30d, trendlines90d] = await Promise.all([
    getTrendlineData(userId, 30),
    getTrendlineData(userId, 90)
  ])
  
  // Calculate totals for each period
  const last30d = {
    views: trendlines30d.views.reduce((sum, day) => sum + day.value, 0),
    calls: trendlines30d.calls.reduce((sum, day) => sum + day.value, 0),
    emails: trendlines30d.emails.reduce((sum, day) => sum + day.value, 0),
    endorsements: trendlines30d.endorsements.reduce((sum, day) => sum + day.value, 0)
  }
  
  const last90d = {
    views: trendlines90d.views.reduce((sum, day) => sum + day.value, 0),
    calls: trendlines90d.calls.reduce((sum, day) => sum + day.value, 0),
    emails: trendlines90d.emails.reduce((sum, day) => sum + day.value, 0),
    endorsements: trendlines90d.endorsements.reduce((sum, day) => sum + day.value, 0)
  }
  
  // Calculate growth percentages (30d vs 90d average)
  const growth = {
    views: last90d.views > 0 ? ((last30d.views - (last90d.views / 3)) / (last90d.views / 3)) * 100 : 0,
    calls: last90d.calls > 0 ? ((last30d.calls - (last90d.calls / 3)) / (last90d.calls / 3)) * 100 : 0,
    emails: last90d.emails > 0 ? ((last30d.emails - (last90d.emails / 3)) / (last90d.emails / 3)) * 100 : 0,
    endorsements: last90d.endorsements > 0 ? ((last30d.endorsements - (last90d.endorsements / 3)) / (last90d.endorsements / 3)) * 100 : 0
  }
  
  return {
    last30d,
    last90d,
    growth: {
      views: Math.round(growth.views * 100) / 100,
      calls: Math.round(growth.calls * 100) / 100,
      emails: Math.round(growth.emails * 100) / 100,
      endorsements: Math.round(growth.endorsements * 100) / 100
    }
  }
}
