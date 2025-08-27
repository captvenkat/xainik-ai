"use client"

import { useState, useEffect } from 'react'
import { Phone, Mail } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { tracking } from '@/lib/tracking'

interface ContactButtonsProps {
  phone?: string | undefined
  email?: string | undefined
  referralId?: string | undefined
  pitchId?: string | undefined
  veteranName?: string | undefined
  pitchTitle?: string | undefined
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
      const supabase = createSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setUserRole(profile?.role as string || null)
      }
      setIsLoading(false)
    }

    checkUserRole()
  }, [])

  const onCall = async () => {
    if (pitchId) {
      try {
        // Track the call click using the tracking library
        const { tracking } = await import('@/lib/tracking')
        await tracking.callClicked(pitchId, referralId, undefined, 'web')
      } catch (error) {
        console.error('Error tracking call click:', error)
        // Don't break the UI if logging fails
      }
    }
    
    if (phone) window.location.href = `tel:${phone}`
  }

  const onEmail = async () => {
    if (pitchId) {
      try {
        // Track the email click using the tracking library
        const { tracking } = await import('@/lib/tracking')
        await tracking.emailClicked(pitchId, referralId, undefined, 'web')
      } catch (error) {
        console.error('Error tracking email click:', error)
        // Don't break the UI if logging fails
      }
    }
    
    if (email) window.location.href = `mailto:${email}`
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button 
        data-track="call"
        onClick={onCall} 
        className="btn-success inline-flex items-center gap-2"
        disabled={!phone}
      >
        <Phone className="h-4 w-4" /> 
        {phone ? 'Call' : 'No Phone'}
      </button>
      <button 
        data-track="email"
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
