'use server'

import { createActionClient } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/email'

export async function generateWeeklyReport(userId: string, pitchId?: string) {
  try {
    const supabase = await createActionClient()
    
    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Get pitch data if available
    let pitchData = null
    if (pitchId) {
      const { data: pitch } = await supabase
        .from('pitches')
        .select('title, views_count, likes_count, shares_count, endorsements_count, created_at')
        .eq('id', pitchId)
        .single()
      
      pitchData = pitch
    }

    // Get weekly activity
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: weeklyActivity } = await supabase
      .from('referral_events')
      .select('event_type, platform, created_at')
      .eq('referral_id', pitchId || userId)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false })

    // Calculate metrics
    const totalViews = pitchData?.views_count || 0
    const totalLikes = pitchData?.likes_count || 0
    const totalShares = pitchData?.shares_count || 0
    const totalEndorsements = pitchData?.endorsements_count || 0

    // Note: referral_events table has limited schema in live database
    // Skip calculating weekly activity until schema is properly migrated
    // const weeklyViews = weeklyActivity?.filter(e => e.event_type === 'VIEW').length || 0
    // const weeklyShares = weeklyActivity?.filter(e => e.event_type === 'SHARE').length || 0
    
    const weeklyViews = 0 // Placeholder until schema is migrated
    const weeklyShares = 0 // Placeholder until schema is migrated

    // Generate report content
    const reportContent = `
      <h2>Weekly Performance Report</h2>
      <p>Hi ${user.name},</p>
      
      <p>Here's your weekly performance summary:</p>
      
      <h3>Overall Metrics</h3>
      <ul>
        <li>Total Views: ${totalViews}</li>
        <li>Total Likes: ${totalLikes}</li>
        <li>Total Shares: ${totalShares}</li>
        <li>Total Endorsements: ${totalEndorsements}</li>
      </ul>
      
      <h3>This Week's Activity</h3>
      <ul>
        <li>New Views: ${weeklyViews}</li>
        <li>New Shares: ${weeklyShares}</li>
      </ul>
      
      <h3>Recommendations</h3>
      ${generateRecommendations(totalViews, totalLikes, totalShares, totalEndorsements)}
      
      <p>Keep up the great work!</p>
      
      <p>Best regards,<br>The Xainik Team</p>
    `

    return {
      success: true,
      data: {
        reportContent,
        metrics: {
          totalViews,
          totalLikes,
          totalShares,
          totalEndorsements,
          weeklyViews,
          weeklyShares
        }
      }
    }
  } catch (error) {
    console.error('Error generating weekly report:', error)
    return { success: false, error: 'Failed to generate report' }
  }
}

export async function sendWeeklyReport(userId: string, pitchId?: string) {
  try {
    const report = await generateWeeklyReport(userId, pitchId)
    
    if (!report.success) {
      return report
    }

    const supabase = await createActionClient()
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Your Weekly Xainik Performance Report',
      html: report.data?.reportContent || 'No report content available'
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending weekly report:', error)
    return { success: false, error: 'Failed to send report' }
  }
}

export async function generateMonthlyReport(userId: string, pitchId?: string) {
  try {
    const supabase = await createActionClient()
    
    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Get monthly data - commented out due to limited referral_events schema
    // const monthAgo = new Date()
    // monthAgo.setMonth(monthAgo.getMonth() - 1)

    // const { data: monthlyActivity } = await supabase
    //   .from('referral_events')
    //   .select('event_type, platform, created_at')
    //   .eq('referral_id', pitchId || userId)
    //   .gte('created_at', monthAgo.toISOString())
    //   .order('created_at', { ascending: false })

    // Note: referral_events table has limited schema in live database
    // Skip calculating monthly activity until schema is properly migrated
    // const monthlyViews = monthlyActivity?.filter(e => e.event_type === 'VIEW').length || 0
    // const monthlyShares = monthlyActivity?.filter(e => e.event_type === 'SHARE').length || 0
    // const monthlyLikes = monthlyActivity?.filter(e => e.event_type === 'LIKE').length || 0
    
    const monthlyViews = 0 // Placeholder until schema is migrated
    const monthlyShares = 0 // Placeholder until schema is migrated
    const monthlyLikes = 0 // Placeholder until schema is migrated

    // Get platform breakdown - placeholder until schema is migrated
    const platformStats = {} as Record<string, number>

    const reportContent = `
      <h2>Monthly Performance Report</h2>
      <p>Hi ${user.name},</p>
      
      <p>Here's your comprehensive monthly performance summary:</p>
      
      <h3>Monthly Metrics</h3>
      <ul>
        <li>Total Views: ${monthlyViews}</li>
        <li>Total Shares: ${monthlyShares}</li>
        <li>Total Likes: ${monthlyLikes}</li>
      </ul>
      
      <h3>Platform Performance</h3>
      <ul>
        ${Object.entries(platformStats).map(([platform, count]) => 
          `<li>${platform}: ${count} interactions</li>`
        ).join('')}
      </ul>
      
      <h3>Monthly Insights</h3>
      ${generateMonthlyInsights(monthlyViews, monthlyShares, monthlyLikes)}
      
      <p>Keep building your network and growing your opportunities!</p>
      
      <p>Best regards,<br>The Xainik Team</p>
    `

    return {
      success: true,
      data: {
        reportContent,
        metrics: {
          monthlyViews,
          monthlyShares,
          monthlyLikes,
          platformStats
        }
      }
    }
  } catch (error) {
    console.error('Error generating monthly report:', error)
    return { success: false, error: 'Failed to generate monthly report' }
  }
}

function generateRecommendations(views: number, likes: number, shares: number, endorsements: number): string {
  const recommendations = []

  if (views === 0) {
    recommendations.push('Start sharing your pitch on social media to get your first views')
  } else if (views > 0 && shares === 0) {
    recommendations.push('People are viewing your pitch! Share it more to reach a wider audience')
  }

  if (likes > 0 && endorsements === 0) {
    recommendations.push('Ask people who like your pitch for endorsements to build credibility')
  }

  if (shares > 0 && likes === 0) {
    recommendations.push('Your pitch is being shared! Consider optimizing your content to encourage likes')
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job! Keep engaging with your network and sharing your pitch')
  }

  return `<ul>${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>`
}

function generateMonthlyInsights(views: number, shares: number, likes: number): string {
  const insights = []

  if (views > 50) {
    insights.push('Excellent visibility! Your pitch is reaching a wide audience')
  } else if (views > 20) {
    insights.push('Good progress! Keep sharing to increase your reach')
  }

  if (shares > 10) {
    insights.push('Strong network engagement! Your connections are actively supporting you')
  }

  if (likes > 5) {
    insights.push('High-quality content! People are responding positively to your pitch')
  }

  if (insights.length === 0) {
    insights.push('Focus on sharing your pitch more actively to increase engagement')
  }

  return `<ul>${insights.map(insight => `<li>${insight}</li>`).join('')}</ul>`
}
