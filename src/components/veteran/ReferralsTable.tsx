'use client'

import { useState } from 'react'
import { 
  Filter, 
  Download, 
  Eye, 
  Share2, 
  Heart, 
  Phone, 
  Mail, 
  FileText,
  Award,
  Calendar,
  User
} from 'lucide-react'

interface ReferralEvent {
  id: string
  event_type: string
  platform: string
  mode: 'self' | 'supporter' | 'anonymous'
  occurred_at: string
  referral_id: string
  supporter_name?: string
  supporter_email?: string
}

interface ReferralsTableProps {
  data: ReferralEvent[]
  onFilterChange?: (filters: any) => void
}

export default function ReferralsTable({ data, onFilterChange }: ReferralsTableProps) {
  const [filters, setFilters] = useState({
    mode: 'all',
    platform: 'all',
    eventType: 'all'
  })

  const [sortBy, setSortBy] = useState<'date' | 'type' | 'platform'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Eye className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No referral activity yet</h3>
        <p className="text-gray-500">Start sharing your pitch to see referral events here</p>
      </div>
    )
  }

  // Filter data based on current filters
  const filteredData = data.filter(event => {
    if (filters.mode !== 'all' && event.mode !== filters.mode) return false
    if (filters.platform !== 'all' && event.platform !== filters.platform) return false
    if (filters.eventType !== 'all' && event.event_type !== filters.eventType) return false
    return true
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.occurred_at).getTime()
        bValue = new Date(b.occurred_at).getTime()
        break
      case 'type':
        aValue = a.event_type
        bValue = b.event_type
        break
      case 'platform':
        aValue = a.platform
        bValue = b.platform
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Get unique values for filters
  const modes = [...new Set(data.map(e => e.mode))]
  const platforms = [...new Set(data.map(e => e.platform))]
  const eventTypes = [...new Set(data.map(e => e.event_type))]

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSort = (column: 'date' | 'type' | 'platform') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view': return <Eye className="w-4 h-4 text-blue-500" />
      case 'share': return <Share2 className="w-4 h-4 text-green-500" />
      case 'like': return <Heart className="w-4 h-4 text-red-500" />
      case 'contact': return <Phone className="w-4 h-4 text-purple-500" />
      case 'resume': return <FileText className="w-4 h-4 text-orange-500" />
      case 'hire': return <Award className="w-4 h-4 text-yellow-500" />
      default: return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'view': return 'View'
      case 'share': return 'Share'
      case 'like': return 'Like'
      case 'contact': return 'Contact'
      case 'resume': return 'Resume'
      case 'hire': return 'Hire'
      default: return eventType.charAt(0).toUpperCase() + eventType.slice(1)
    }
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'self': return 'Self'
      case 'supporter': return 'Supporter'
      case 'anonymous': return 'Anonymous'
      default: return mode.charAt(0).toUpperCase() + mode.slice(1)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return '1d ago'
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header with filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Referral Events</h3>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        
        {/* Filter controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.mode}
              onChange={(e) => handleFilterChange('mode', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modes</option>
              {modes.map(mode => (
                <option key={mode} value={mode}>{getModeLabel(mode)}</option>
              ))}
            </select>
          </div>
          
          <select
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</option>
            ))}
          </select>
          
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{getEventLabel(type)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Type
                  {sortBy === 'type' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('platform')}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Platform
                  {sortBy === 'platform' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mode
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Time
                  {sortBy === 'date' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.event_type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {getEventLabel(event.event_type)}
                      </div>
                      {event.supporter_name && (
                        <div className="text-sm text-gray-500">
                          by {event.supporter_name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {event.event_type}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{event.platform}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.mode === 'self' ? 'bg-green-100 text-green-800' :
                    event.mode === 'supporter' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getModeLabel(event.mode)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.occurred_at)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredData.length} of {data.length} events</span>
          <span>Last updated: {formatDate(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  )
}
