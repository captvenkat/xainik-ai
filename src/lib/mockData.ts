export interface MockPitch {
  id: string
  name: string
  service: string
  city: string
  targetRoles: string[]
  endorsements: number
  stats: {
    opens: number
    reads: number
    clicks: number
    sharesToday: number
    callsWeek: number
    resume: {
      pending: number
      approved: number
    }
  }
}

export interface MockEvent {
  id: string
  type: 'veteran_joined' | 'endorsement_added' | 'referral_shared' | 'recruiter_called' | 'resume_requested' | 'resume_approved'
  actor: string
  target?: string
  timestamp: Date
}

export interface DonationStats {
  todayTotal: number
  todayHighest: number
  weekTotal: number
}

// Mock Indian names and context
const INDIAN_NAMES = [
  'Arjun Singh',
  'Anita Rao',
  'Meera Nair',
  'Col. Sharma',
  'Capt. Patel',
  'Lt. Gupta',
  'Maj. Kumar',
  'Sgt. Verma',
  'Cdr. Iyer',
  'Wg Cdr. Menon'
]

const INDIAN_SERVICES = [
  'Army',
  'Navy',
  'Air Force',
  'Paramilitary',
  'Defence Research'
]

const INDIAN_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Ahmedabad'
]

const TARGET_ROLES = [
  'Operations Manager',
  'Project Manager',
  'Security Consultant',
  'Logistics Coordinator',
  'Training Specialist',
  'Risk Manager',
  'Compliance Officer',
  'Strategic Planner'
]

export function makeMockPitch(index: number): MockPitch {
  const nameIndex = index % INDIAN_NAMES.length
  const serviceIndex = index % INDIAN_SERVICES.length
  const cityIndex = index % INDIAN_CITIES.length
  
  const name = INDIAN_NAMES[nameIndex]!
  const service = INDIAN_SERVICES[serviceIndex]!
  const city = INDIAN_CITIES[cityIndex]!
  const targetRoles = TARGET_ROLES.slice(index % 3, (index % 3) + 2)
  
  return {
    id: `pitch_${index}`,
    name,
    service,
    city,
    targetRoles,
    endorsements: Math.floor(Math.random() * 5) + 1,
    stats: {
      opens: Math.floor(Math.random() * 200) + 50,
      reads: Math.floor(Math.random() * 100) + 25,
      clicks: Math.floor(Math.random() * 50) + 10,
      sharesToday: Math.floor(Math.random() * 20) + 5,
      callsWeek: Math.floor(Math.random() * 10) + 2,
      resume: {
        pending: Math.floor(Math.random() * 5) + 1,
        approved: Math.floor(Math.random() * 3) + 1
      }
    }
  }
}

export function generateMockEvents(count: number = 10): MockEvent[] {
  const events: MockEvent[] = []
  const eventTypes: MockEvent['type'][] = [
    'veteran_joined',
    'endorsement_added',
    'referral_shared',
    'recruiter_called',
    'resume_requested',
    'resume_approved'
  ]

  for (let i = 0; i < count; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]!
    const actor = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)]!
    const target = type !== 'veteran_joined' ? INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)]! : undefined
    
    events.push({
      id: `event_${i}`,
      type,
      actor,
      target,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h
    })
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function generateMockDonations(): DonationStats {
  return {
    todayTotal: Math.floor(Math.random() * 50000) + 10000, // ₹10k - ₹60k
    todayHighest: Math.floor(Math.random() * 10000) + 2000, // ₹2k - ₹12k
    weekTotal: Math.floor(Math.random() * 200000) + 50000 // ₹50k - ₹250k
  }
}

export function getEventMessage(event: MockEvent): string {
  switch (event.type) {
    case 'veteran_joined':
      return `${event.actor} joined Xainik`
    case 'endorsement_added':
      return `${event.actor} endorsed ${event.target}`
    case 'referral_shared':
      return `${event.actor} referred ${event.target}'s pitch`
    case 'recruiter_called':
      return `Recruiter called ${event.target}`
    case 'resume_requested':
      return `Resume requested: ${event.target}`
    case 'resume_approved':
      return `Resume approved: ${event.target}`
    default:
      return 'New activity on platform'
  }
}
