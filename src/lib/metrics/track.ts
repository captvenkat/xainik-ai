import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface TrackEventData {
  user_id: string
  pitch_id?: string
  ts: string
  [key: string]: any
}

async function trackEvent(eventName: string, data: TrackEventData) {
  try {
    const supabase = createSupabaseBrowser()
    
    await supabase
      .from('activity_log')
      .insert({
        event: eventName,
        meta: {
          ...data,
          timestamp: new Date().toISOString()
        }
      })
  } catch (error) {
    console.error('Failed to track event:', eventName, error)
  }
}

// Dashboard events
export async function trackDashboardViewed(userId: string, pitchId?: string) {
  await trackEvent('dashboard_viewed', {
    user_id: userId,
    pitch_id: pitchId,
    ts: new Date().toISOString()
  })
}

// Share events
export async function trackShareModalOpened(userId: string, pitchId?: string) {
  await trackEvent('share_modal_opened', {
    user_id: userId,
    pitch_id: pitchId,
    ts: new Date().toISOString()
  })
}

export async function trackSharePerformed(userId: string, channel: string, mode: string, pitchId?: string) {
  await trackEvent('share_performed', {
    user_id: userId,
    pitch_id: pitchId,
    channel,
    mode,
    ts: new Date().toISOString()
  })
}

// Supporter events
export async function trackThankSupporterOpened(userId: string, supporterId: string, pitchId?: string) {
  await trackEvent('thank_supporter_opened', {
    user_id: userId,
    pitch_id: pitchId,
    supporter_id: supporterId,
    ts: new Date().toISOString()
  })
}

export async function trackSupporterThanked(userId: string, supporterId: string, pitchId?: string) {
  await trackEvent('supporter_thanked', {
    user_id: userId,
    pitch_id: pitchId,
    supporter_id: supporterId,
    ts: new Date().toISOString()
  })
}

export async function trackSupporterAskAgainOpened(userId: string, supporterId: string, pitchId?: string) {
  await trackEvent('supporter_ask_again_opened', {
    user_id: userId,
    pitch_id: pitchId,
    supporter_id: supporterId,
    ts: new Date().toISOString()
  })
}

export async function trackSupporterReshareRequested(userId: string, supporterId: string, pitchId?: string) {
  await trackEvent('supporter_reshare_requested', {
    user_id: userId,
    pitch_id: pitchId,
    supporter_id: supporterId,
    ts: new Date().toISOString()
  })
}

export async function trackInviteSupportersOpened(userId: string, pitchId?: string) {
  await trackEvent('invite_supporters_opened', {
    user_id: userId,
    pitch_id: pitchId,
    ts: new Date().toISOString()
  })
}

export async function trackSupporterInviteSent(userId: string, pitchId?: string) {
  await trackEvent('supporter_invite_sent', {
    user_id: userId,
    pitch_id: pitchId,
    ts: new Date().toISOString()
  })
}

// Contact events
export async function trackFollowUpOpened(userId: string, contactId: string, pitchId?: string) {
  await trackEvent('followup_opened', {
    user_id: userId,
    pitch_id: pitchId,
    contact_id: contactId,
    ts: new Date().toISOString()
  })
}

export async function trackContactFollowUpSent(userId: string, contactId: string, pitchId?: string) {
  await trackEvent('contact_followup_sent', {
    user_id: userId,
    pitch_id: pitchId,
    contact_id: contactId,
    ts: new Date().toISOString()
  })
}

export async function trackResumeModalOpened(userId: string, contactId: string, pitchId?: string) {
  await trackEvent('resume_modal_opened', {
    user_id: userId,
    pitch_id: pitchId,
    contact_id: contactId,
    ts: new Date().toISOString()
  })
}

export async function trackResumeSent(userId: string, contactId: string, pitchId?: string) {
  await trackEvent('resume_sent', {
    user_id: userId,
    pitch_id: pitchId,
    contact_id: contactId,
    ts: new Date().toISOString()
  })
}

export async function trackContactStatusUpdated(userId: string, contactId: string, status: string, pitchId?: string) {
  await trackEvent('contact_status_updated', {
    user_id: userId,
    pitch_id: pitchId,
    contact_id: contactId,
    status,
    ts: new Date().toISOString()
  })
}

export async function trackNoteAdded(userId: string, contactId: string, pitchId?: string) {
  await trackEvent('note_added', {
    user_id: userId,
    pitch_id: pitchId,
    contact_id: contactId,
    ts: new Date().toISOString()
  })
}

// Date range and filter events
export async function trackDateRangeChanged(userId: string, range: string, pitchId?: string) {
  await trackEvent('date_range_changed', {
    user_id: userId,
    pitch_id: pitchId,
    range,
    ts: new Date().toISOString()
  })
}

export async function trackPitchChanged(userId: string, pitchId: string) {
  await trackEvent('pitch_changed', {
    user_id: userId,
    pitch_id: pitchId,
    ts: new Date().toISOString()
  })
}
