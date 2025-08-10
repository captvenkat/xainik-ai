"use client"

import { useState, useEffect } from 'react'
import { Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabaseClient'
import { logActivity } from '@/lib/activity'
import { trackReferralEvent } from '@/lib/referrals'

interface ContactButtonsProps {
  phone?: string
  email?: string
  referralId?: string
  pitchId?: string
  veteranName?: string
  pitchTitle?: string
}

export default function ContactButtons({ 
  phone, 
  email, 
  referralId,
  pitchId,
  veteranName,
  pitchTitle
}: ContactButtonsProps) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setUserRole(profile?.role || null)
      }
      setIsLoading(false)
    }

    checkUserRole()
  }, [])

  const onCall = async () => {
    if (referralId) {
      try {
        await trackReferralEvent({
          referral_id: referralId,
          event_type: 'CALL_CLICKED',
          platform: 'web',
          user_agent: navigator.userAgent,
          ip_hash: 'client-side'
        })
      } catch (error) {
        console.error('Failed to log referral event:', error)
      }
    }
    
    try {
      await logActivity('recruiter_called', { 
        phone,
        veteran_name: veteranName,
        pitch_title: pitchTitle
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
    
    if (phone) window.location.href = `tel:${phone}`
  }

  const onEmail = async () => {
    if (referralId) {
      try {
        await trackReferralEvent({
          referral_id: referralId,
          event_type: 'EMAIL_CLICKED',
          platform: 'web',
          user_agent: navigator.userAgent,
          ip_hash: 'client-side'
        })
      } catch (error) {
        console.error('Failed to log referral event:', error)
      }
    }
    
    try {
      await logActivity('recruiter_called', { 
        email,
        veteran_name: veteranName,
        pitch_title: pitchTitle
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
    
    if (email) window.location.href = `mailto:${email}`
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button 
        onClick={onCall} 
        className="btn-success inline-flex items-center gap-2"
        disabled={!phone}
      >
        <Phone className="h-4 w-4" /> 
        {phone ? 'Call' : 'No Phone'}
      </button>
      <button 
        onClick={onEmail} 
        className="btn-secondary inline-flex items-center gap-2"
        disabled={!email}
      >
        <Mail className="h-4 w-4" /> 
        {email ? 'Email' : 'No Email'}
      </button>
    </div>
  )
}
