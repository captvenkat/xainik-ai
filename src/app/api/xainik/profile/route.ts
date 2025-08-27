import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Merge auth data with profile data
    const mergedProfile = {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
      location: profile?.location || null,
      phone: profile?.phone || null,
      linkedin_url: profile?.linkedin_url || null,
      alt_email: profile?.alt_email || null,
      service_start_date: profile?.service_start_date || null,
      service_end_date: profile?.service_end_date || null,
      years_of_service: profile?.years_of_service || null,
      is_veteran: profile?.is_veteran || false,
      retirement_type: profile?.retirement_type || null,
      discharge_reason: profile?.discharge_reason || null,
      pii_confirmed: profile?.pii_confirmed || false,
      created_at: profile?.created_at || user.created_at,
      updated_at: profile?.updated_at || user.updated_at
    }

    // Get suggestions from profile
    const suggestions = profile?.suggestions || {}

    return NextResponse.json({
      profile: mergedProfile,
      suggestions
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      full_name,
      location,
      phone,
      linkedin_url,
      alt_email,
      service_start_date,
      service_end_date,
      years_of_service,
      is_veteran,
      retirement_type,
      discharge_reason
    } = body

    // Calculate years of service if both dates are provided
    let calculatedYearsOfService = years_of_service
    if (service_start_date && service_end_date && !years_of_service) {
      const start = new Date(service_start_date)
      const end = new Date(service_end_date)
      calculatedYearsOfService = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name,
        location,
        phone,
        linkedin_url,
        alt_email,
        service_start_date,
        service_end_date,
        years_of_service: calculatedYearsOfService,
        is_veteran,
        retirement_type,
        discharge_reason,
        pii_confirmed: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Clear accepted suggestions
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('suggestions')
      .eq('id', user.id)
      .single()

    if (currentProfile?.suggestions) {
      const updatedSuggestions = { ...currentProfile.suggestions }
      
      // Clear accepted fields from suggestions
      if (full_name && updatedSuggestions.contact?.full_name) {
        delete updatedSuggestions.contact.full_name
      }
      if (location && updatedSuggestions.contact?.location) {
        delete updatedSuggestions.contact.location
      }
      if (phone && updatedSuggestions.contact?.phone) {
        delete updatedSuggestions.contact.phone
      }
      if (linkedin_url && updatedSuggestions.contact?.linkedin_url) {
        delete updatedSuggestions.contact.linkedin_url
      }
      if (alt_email && updatedSuggestions.contact?.email) {
        delete updatedSuggestions.contact.email
      }
      if (service_start_date && updatedSuggestions.service?.service_start_date) {
        delete updatedSuggestions.service.service_start_date
      }
      if (service_end_date && updatedSuggestions.service?.service_end_date) {
        delete updatedSuggestions.service.service_end_date
      }
      if (calculatedYearsOfService && updatedSuggestions.service?.years_of_service) {
        delete updatedSuggestions.service.years_of_service
      }

      // Update suggestions
      await supabase
        .from('profiles')
        .update({ suggestions: updatedSuggestions })
        .eq('id', user.id)
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
