import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET() {
  try {
    // Get recent donations with donor info
    const { data: recentDonations, error: donationsError } = await supabaseAdmin
      .from('donations')
      .select(`
        id,
        amount,
        is_anonymous,
        display_name,
        created_at,
        donors (
          name,
          email,
          is_public
        )
      `)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(100)

    if (donationsError) {
      console.error('Error fetching donations:', donationsError)
      return NextResponse.json(
        { error: 'Failed to fetch donations' },
        { status: 500 }
      )
    }

    // Get badge tiers
    const { data: badgeTiers, error: badgesError } = await supabaseAdmin
      .from('badge_tiers')
      .select('*')
      .order('min_amount', { ascending: true })

    if (badgesError) {
      console.error('Error fetching badge tiers:', badgesError)
      return NextResponse.json(
        { error: 'Failed to fetch badge tiers' },
        { status: 500 }
      )
    }

    // Get total statistics
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('v_stats')
      .select('*')
      .single()

    if (statsError) {
      console.error('Error fetching stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }

    // Process donations for public display
    const processedDonations = recentDonations?.map(donation => {
      const donor = donation.donors as any
      let displayName = 'Anonymous Hero'
      
      if (!donation.is_anonymous) {
        if (donation.display_name && donation.display_name.trim()) {
          displayName = donation.display_name
        } else if (donor && donor.is_public && donor.name) {
          displayName = donor.name
        }
      }

      // Calculate badge for this donation
      let badge = null
      if (badgeTiers) {
        for (let i = badgeTiers.length - 1; i >= 0; i--) {
          if (donation.amount >= badgeTiers[i].min_amount) {
            badge = badgeTiers[i].name
            break
          }
        }
      }

      return {
        id: donation.id,
        amount: donation.amount,
        displayName,
        badge,
        date: donation.created_at,
        isAnonymous: donation.is_anonymous
      }
    }) || []

    // Group donations by badge tiers for summary
    const badgeSummary = badgeTiers?.map(tier => {
      const donorsInTier = processedDonations.filter(d => d.badge === tier.name)
      const totalAmount = donorsInTier.reduce((sum, d) => sum + d.amount, 0)
      
      return {
        tier: tier.name,
        minAmount: tier.min_amount,
        donorCount: donorsInTier.length,
        totalAmount
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: {
        donations: processedDonations,
        badgeSummary,
        stats: {
          totalRaised: stats?.total_raised || 0,
          totalDonors: stats?.total_count || 0,
          highestSingle: stats?.highest_single || 0,
          todayRaised: stats?.today_raised || 0
        }
      }
    })

  } catch (error) {
    console.error('Donor wall API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
