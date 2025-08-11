import type { Trendline, CohortRow, AvgTime, WindowOpt } from '@/lib/metrics'

// Mock trendline data
export function getMockTrendlineData(opt: WindowOpt): Trendline[] {
  const points: Array<{ date: string; value: number }> = []
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - opt.window)
  
  for (let i = 0; i < opt.window; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
          points.push({
        date: date.toISOString().split('T')[0] || date.toISOString(),
        value: Math.floor(Math.random() * 10)
      })
  }
  
  return [
    {
      label: 'pitch_viewed',
      points,
      window: opt.window
    },
    {
      label: 'recruiter_called',
      points: points.map(p => ({ ...p, value: Math.floor(p.value * 0.3) })),
      window: opt.window
    },
    {
      label: 'recruiter_emailed',
      points: points.map(p => ({ ...p, value: Math.floor(p.value * 0.2) })),
      window: opt.window
    }
  ]
}

// Mock cohort data
export function getMockCohortData(opt: WindowOpt): CohortRow[] {
  return [
    {
      source: 'whatsapp',
      referrals: 15,
      opens: 12,
      views: 10,
      calls: 3,
      emails: 1,
      conv_view_to_call: 0.3,
      conv_view_to_email: 0.1
    },
    {
      source: 'linkedin',
      referrals: 8,
      opens: 7,
      views: 6,
      calls: 2,
      emails: 2,
      conv_view_to_call: 0.33,
      conv_view_to_email: 0.33
    },
    {
      source: 'email',
      referrals: 5,
      opens: 4,
      views: 3,
      calls: 1,
      emails: 2,
      conv_view_to_call: 0.33,
      conv_view_to_email: 0.67
    }
  ]
}

// Mock average time data
export function getMockAvgTimeData(opt: WindowOpt): AvgTime {
  return {
    hours: 4.5,
    samples: 12
  }
}

// Mock the actual functions
export const getTrendlineAllPitches = async (opt: WindowOpt): Promise<Trendline[]> => {
  return getMockTrendlineData(opt)
}

export const getCohortsBySource = async (opt: WindowOpt): Promise<CohortRow[]> => {
  return getMockCohortData(opt)
}

export const getAvgTimeToFirstContact = async (opt: WindowOpt): Promise<AvgTime> => {
  return getMockAvgTimeData(opt)
}
