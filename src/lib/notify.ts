import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { createAdminClient } from './supabaseAdmin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type NotificationType = 
  | 'resume_request_received'
  | 'resume_request_approved'
  | 'resume_request_declined'
  | 'endorsement_received'
  | 'endorsement_verified_badge'
  | 'referral_accepted'
  | 'referral_opened'
  | 'pitch_viewed'
  | 'call_clicked'
  | 'email_clicked'
  | 'plan_expiry_warning'
  | 'plan_expired'
  | 'donation_received'

export interface NotificationPayload {
  [key: string]: any
}

export interface NotificationData {
  userId: string
  type: NotificationType
  payload: NotificationPayload
  channel?: 'IN_APP' | 'EMAIL' | 'BOTH'
}

// Check if user is in quiet hours
async function isInQuietHours(userId: string): Promise<boolean> {
  const supabase = createSupabaseServerOnly()
  
  const { data: prefs } = await supabase
    .from('notification_prefs')
    .select('quiet_hours_start, quiet_hours_end')
    .eq('user_id', userId)
    .single()

  if (!prefs?.quiet_hours_start || !prefs?.quiet_hours_end) {
    return false
  }

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  const startMinutes = parseInt(prefs.quiet_hours_start.split(':')[0]) * 60 + parseInt(prefs.quiet_hours_start.split(':')[1])
  const endMinutes = parseInt(prefs.quiet_hours_end.split(':')[0]) * 60 + parseInt(prefs.quiet_hours_end.split(':')[1])

  if (startMinutes <= endMinutes) {
    return currentTime >= startMinutes && currentTime <= endMinutes
  } else {
    // Crosses midnight
    return currentTime >= startMinutes || currentTime <= endMinutes
  }
}

// Get user notification preferences
async function getUserNotificationPrefs(userId: string): Promise<{
  email_enabled: boolean
  in_app_enabled: boolean
  digest_enabled: boolean
}> {
  const supabase = createSupabaseServerOnly()
  
  const { data: prefs } = await supabase
    .from('notification_prefs')
    .select('email_enabled, in_app_enabled, digest_enabled')
    .eq('user_id', userId)
    .single()

  return {
    email_enabled: prefs?.email_enabled ?? true,
    in_app_enabled: prefs?.in_app_enabled ?? true,
    digest_enabled: prefs?.digest_enabled ?? true
  }
}

// Create in-app notification
async function createInAppNotification(userId: string, type: NotificationType, payload: NotificationPayload): Promise<void> {
  const supabase = createAdminClient()
  
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      payload_json: payload,
      channel: 'IN_APP',
      status: 'SENT'
    })
}

// Send email notification
async function sendEmailNotification(userId: string, type: NotificationType, payload: NotificationPayload): Promise<void> {
  const supabase = createSupabaseServerOnly()
  
  // Get user email
  const { data: user } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', userId)
    .single()

  if (!user?.email) {
    return
  }

  // Check if in quiet hours
  const inQuietHours = await isInQuietHours(userId)
  if (inQuietHours) {
    return
  }

  // Generate email content based on notification type
  const { subject, html } = generateEmailContent(type, payload, user.name)

  try {
    const { data, error } = await resend.emails.send({
      from: 'Xainik <notifications@xainik.com>',
      to: user.email,
      subject,
      html
    })

    if (error) {
      // Log to email_logs
      await supabase
        .from('email_logs')
        .insert({
          user_id: userId,
          email_to: user.email,
          subject,
          template: type,
          payload,
          status: 'FAILED'
        })
    } else {
      // Log successful email
      await supabase
        .from('email_logs')
        .insert({
          user_id: userId,
          email_to: user.email,
          subject,
          template: type,
          message_id: data?.id,
          payload,
          status: 'SENT'
        })
    }
  } catch (error) {
  }
}

// Generate email content
function generateEmailContent(type: NotificationType, payload: NotificationPayload, userName?: string): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xainik.com'
  
  switch (type) {
    case 'resume_request_received':
      return {
        subject: `Resume Request from ${payload.recruiter_name}`,
        html: `
          <h2>New Resume Request</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>${payload.recruiter_name} from ${payload.company_name} has requested your resume for the position of ${payload.job_title}.</p>
          <p><strong>Message:</strong> ${payload.message || 'No message provided'}</p>
          <p><a href="${baseUrl}/dashboard/veteran">View and respond to this request</a></p>
        `
      }

    case 'resume_request_approved':
      return {
        subject: 'Resume Request Approved',
        html: `
          <h2>Resume Request Approved</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Your resume request for ${payload.veteran_name} has been approved.</p>
          <p><a href="${baseUrl}/dashboard/recruiter">View the resume</a></p>
        `
      }

    case 'resume_request_declined':
      return {
        subject: 'Resume Request Declined',
        html: `
          <h2>Resume Request Declined</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Your resume request for ${payload.veteran_name} has been declined.</p>
          <p><a href="${baseUrl}/dashboard/recruiter">View other candidates</a></p>
        `
      }

    case 'endorsement_received':
      return {
        subject: `New Endorsement from ${payload.endorser_name}`,
        html: `
          <h2>New Endorsement</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>${payload.endorser_name} has endorsed your pitch!</p>
          <p><strong>Message:</strong> ${payload.message}</p>
          <p><a href="${baseUrl}/dashboard/veteran">View your endorsements</a></p>
        `
      }

    case 'endorsement_verified_badge':
      return {
        subject: '🎉 You\'ve earned the Community Verified Badge!',
        html: `
          <h2>Community Verified Badge</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Congratulations! You\'ve received 10+ endorsements and earned the Community Verified Badge.</p>
          <p>This badge will help you stand out to recruiters and increase your visibility.</p>
          <p><a href="${baseUrl}/dashboard/veteran">View your profile</a></p>
        `
      }

    case 'referral_accepted':
      return {
        subject: `Referral Accepted by ${payload.veteran_name}`,
        html: `
          <h2>Referral Accepted</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Great news! ${payload.veteran_name} has accepted your referral.</p>
          <p><a href="${baseUrl}/dashboard/supporter">Track your referral performance</a></p>
        `
      }

    case 'plan_expiry_warning':
      return {
        subject: '⚠️ Your Xainik plan expires soon',
        html: `
          <h2>Plan Expiry Warning</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Your ${payload.plan_tier} plan expires in ${payload.days_left} days.</p>
          <p>Renew now to maintain your visibility and continue receiving opportunities.</p>
          <p><a href="${baseUrl}/pricing">Renew your plan</a></p>
        `
      }

    case 'plan_expired':
      return {
        subject: '❌ Your Xainik plan has expired',
        html: `
          <h2>Plan Expired</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Your ${payload.plan_tier} plan has expired. Your pitch is no longer visible to recruiters.</p>
          <p>Renew now to restore your visibility and continue receiving opportunities.</p>
          <p><a href="${baseUrl}/pricing">Renew your plan</a></p>
        `
      }

    default:
      return {
        subject: 'New notification from Xainik',
        html: `
          <h2>New Notification</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>You have a new notification from Xainik.</p>
          <p><a href="${baseUrl}/dashboard">View your dashboard</a></p>
        `
      }
  }
}

// Main notification function
export async function notify(data: NotificationData): Promise<void> {
  const { userId, type, payload, channel = 'BOTH' } = data

  // Get user preferences
  const prefs = await getUserNotificationPrefs(userId)

  try {
    // Create in-app notification if enabled
    if ((channel === 'IN_APP' || channel === 'BOTH') && prefs.in_app_enabled) {
      await createInAppNotification(userId, type, payload)
    }

    // Send email notification if enabled
    if ((channel === 'EMAIL' || channel === 'BOTH') && prefs.email_enabled) {
      await sendEmailNotification(userId, type, payload)
    }
  } catch (error) {
  }
}

// Convenience functions for specific notification types
export async function notifyResumeRequestReceived(veteranId: string, recruiterId: string, payload: {
  recruiter_name: string
  company_name: string
  job_title: string
  message?: string
}): Promise<void> {
  await notify({
    userId: veteranId,
    type: 'resume_request_received',
    payload,
    channel: 'BOTH'
  })
}

export async function notifyResumeRequestResponse(recruiterId: string, veteranId: string, approved: boolean, payload: {
  veteran_name: string
}): Promise<void> {
  await notify({
    userId: recruiterId,
    type: approved ? 'resume_request_approved' : 'resume_request_declined',
    payload,
    channel: 'EMAIL'
  })
}

export async function notifyEndorsementReceived(veteranId: string, payload: {
  endorser_name: string
  message: string
}): Promise<void> {
  await notify({
    userId: veteranId,
    type: 'endorsement_received',
    payload,
    channel: 'BOTH'
  })
}

export async function notifyVerifiedBadge(veteranId: string): Promise<void> {
  await notify({
    userId: veteranId,
    type: 'endorsement_verified_badge',
    payload: {},
    channel: 'BOTH'
  })
}

export async function notifyReferralAccepted(supporterId: string, payload: {
  veteran_name: string
}): Promise<void> {
  await notify({
    userId: supporterId,
    type: 'referral_accepted',
    payload,
    channel: 'IN_APP'
  })
}

export async function notifyPlanExpiryWarning(veteranId: string, payload: {
  plan_tier: string
  days_left: number
}): Promise<void> {
  await notify({
    userId: veteranId,
    type: 'plan_expiry_warning',
    payload,
    channel: 'EMAIL'
  })
}

export async function notifyPlanExpired(veteranId: string, payload: {
  plan_tier: string
}): Promise<void> {
  await notify({
    userId: veteranId,
    type: 'plan_expired',
    payload,
    channel: 'EMAIL'
  })
}
