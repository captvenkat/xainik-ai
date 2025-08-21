'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Users, 
  Star, 
  Phone, 
  Mail, 
  Eye, 
  Plus, 
  Filter, 
  Download, 
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  Target,
  Briefcase
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorState from '@/components/ErrorState'
import VeteranValueTicker from '@/components/VeteranValueTicker'
import ShortlistCard from '@/components/recruiter/ShortlistCard'

interface ShortlistItem {
  id: string
  created_at: string
  pitch: {
    id: string
    title: string
    skills: string[]
    location: string
    availability: string
    phone: string
    photo_url?: string
    veteran: {
      name: string
      email: string
    }
  }
}

export default function RecruiterDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchShortlist()
    }
  }, [user])

  const fetchShortlist = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recruiter/shortlist')
      if (response.ok) {
        const data = await response.json()
        setShortlist(data)
      } else {
        setError('Failed to load shortlist')
      }
    } catch (error) {
      setError('Failed to load shortlist')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/recruiter/shortlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      
      if (response.ok) {
        setShortlist(prev => prev.map(item => 
          item.id === id ? { ...item, status } : item
        ))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleContact = async (pitchId: string, contactType: 'call' | 'email') => {
    try {
      // Log the contact
      await fetch('/api/recruiter/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitch_id: pitchId,
          contact_type: contactType,
          outcome: 'scheduled'
        })
      })

      // Find the pitch details for contact
      const shortlistItem = shortlist.find(item => item.pitch.id === pitchId)
      if (shortlistItem) {
        if (contactType === 'call') {
          window.open(`tel:${shortlistItem.pitch.phone}`, '_blank')
        } else {
          window.open(`mailto:${shortlistItem.pitch.veteran.email}`, '_blank')
        }
      }
    } catch (error) {
      console.error('Failed to log contact:', error)
    }
  }

  const filteredShortlist = shortlist.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.pitch.veteran.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pitch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pitch.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesSearch
  })

  const stats = {
    total: shortlist.length,
    shortlisted: shortlist.length,
    contacted: 0,
    interviewed: 0,
    hired: 0
  }

  if (authLoading) return <LoadingSpinner />
  if (error) return <ErrorState error={error} />
  if (!user) return <ErrorState error="Authentication required" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Veteran Value Ticker */}
      <VeteranValueTicker />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Find Your Next Hire
              </h1>
              <p className="text-gray-600 mt-2">
                Fast match, fast contact, fast hire
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/browse')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Veterans
              </button>
              <button
                onClick={() => router.push('/shortlist')}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Star className="w-4 h-4 mr-2" />
                View All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, skills, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
                         <button
               onClick={() => router.push('/browse')}
               className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
             >
               Browse Veterans
             </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.shortlisted}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Phone className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Interviewed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interviewed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shortlisted Candidates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Shortlisted Candidates</h2>
              <div className="flex items-center space-x-2">
                <button
                                     onClick={() => {
                     const csvContent = filteredShortlist.map(item => 
                       `${item.pitch.veteran.name},${item.pitch.title},${item.pitch.phone},${item.pitch.veteran.email},Shortlisted`
                     ).join('\n')
                     const blob = new Blob([`Name,Title,Phone,Email,Status\n${csvContent}`], { type: 'text/csv' })
                     const url = window.URL.createObjectURL(blob)
                     const a = document.createElement('a')
                     a.href = url
                     a.download = 'shortlist.csv'
                     a.click()
                   }}
                  className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredShortlist.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-600 mb-4">
                  {shortlist.length === 0 
                    ? "Start building your shortlist by finding veterans on the browse page"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
                {shortlist.length === 0 && (
                  <button
                    onClick={() => router.push('/browse')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Find Veterans
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShortlist.map((item) => (
                  <ShortlistCard
                    key={item.id}
                    shortlistItem={item}
                    onStatusChange={handleStatusChange}
                    onContact={handleContact}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}