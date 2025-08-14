'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface NudgeData {
  id: string
  type: string
  title: string
  description: string
  actionUrl: string | null
  priority: number
  actioned: boolean
  actionedAt: string | null
  expiresAt: string | null
}

export async function getNudges(pitchId: string): Promise<NudgeData[]> {
  const supabase = await createActionClient()
  
  try {
    const { data, error } = await supabase
      .from('impact_nudges')
      .select('*')
      .eq('pitch_id', pitchId)
      .eq('actioned', false)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching nudges:', error)
      return getDefaultNudges()
    }
    
    if (!data || data.length === 0) {
      return getDefaultNudges()
    }
    
    return data.map(nudge => ({
      id: nudge.id,
      type: nudge.nudge_type,
      title: nudge.title,
      description: nudge.description,
      actionUrl: nudge.action_url,
      priority: nudge.priority,
      actioned: nudge.actioned,
      actionedAt: nudge.actioned_at,
      expiresAt: nudge.expires_at
    }))
  } catch (error) {
    console.error('Error in getNudges:', error)
    return getDefaultNudges()
  }
}

export async function markNudgeActioned(id: string): Promise<boolean> {
  const supabase = await createActionClient()
  
  try {
    const { error } = await supabase
      .from('impact_nudges')
      .update({
        actioned: true,
        actioned_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error marking nudge as actioned:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in markNudgeActioned:', error)
    return false
  }
}

function getDefaultNudges(): NudgeData[] {
  return [
    {
      id: '1',
      type: 'share_pitch',
      title: 'Share Your Pitch',
      description: 'Share your pitch with your network to increase visibility and opportunities.',
      actionUrl: null,
      priority: 1,
      actioned: false,
      actionedAt: null,
      expiresAt: null
    },
    {
      id: '2',
      type: 'invite_supporter',
      title: 'Invite Supporters',
      description: 'Invite friends and colleagues to become supporters and help amplify your pitch.',
      actionUrl: null,
      priority: 2,
      actioned: false,
      actionedAt: null,
      expiresAt: null
    },
    {
      id: '3',
      type: 'update_headline',
      title: 'Optimize Your Headline',
      description: 'Update your pitch headline with high-performing keywords to improve visibility.',
      actionUrl: null,
      priority: 3,
      actioned: false,
      actionedAt: null,
      expiresAt: null
    }
  ]
}
