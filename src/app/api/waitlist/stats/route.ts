import { NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function GET() {
  try {
    const supabase = await createSupabaseServerOnly()

    // Get total waitlist signups
    const { count: totalSignups } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('metadata->waitlist_status', 'is', null)

    // Get recent signups (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { count: recentSignups } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('metadata->waitlist_status', 'is', null)
      .gte('metadata->waitlist_joined_at', yesterday.toISOString())

    // Get service branch distribution
    const { data: branchDistribution } = await supabase
      .from('users')
      .select('metadata->service_branch')
      .not('metadata->waitlist_status', 'is', null)

    const branchCounts = branchDistribution?.reduce((acc: any, user: any) => {
      const branch = user.service_branch
      if (branch) {
        acc[branch] = (acc[branch] || 0) + 1
      }
      return acc
    }, {}) || {}

    return NextResponse.json({
      totalSignups: totalSignups || 0,
      recentSignups: recentSignups || 0,
      branchDistribution: branchCounts,
      maxSpots: 50,
      spotsRemaining: Math.max(0, 50 - (totalSignups || 0))
    })

  } catch (error) {
    console.error('Waitlist stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
