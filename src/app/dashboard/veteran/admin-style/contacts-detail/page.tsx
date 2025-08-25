"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { analyticsService } from '@/lib/services/analyticsService'
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Activity,
  Target,
  Info,
  RefreshCw,
  Calendar,
  Globe,
  Copy,
  Download,
  Users
} from 'lucide-react'

interface ContactsAnalyticsData {
  total: number
  change: number
  overTime: Array<{ date: string; count: number; previousPeriod: number }>
  byType: Array<{ type: string; count: number; percentage: number }>
  viewToContactRate: number
  contactToHireRate: number
  topPerformingContent: Array<{ content: string; contacts: number; conversionRate: number; lastActivity: string }>
  recentContacts: Array<{ timestamp: string; type: string; channel: string; supporterName?: string; status: string; lastActivity: string }>
}

export default function ContactsDetailPage() {
  const router = useRouter()
  const [data, setData] = useState<ContactsAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  useEffect(() => {
    // Check authentication status immediately (only on mount)
    console.log('🔍 useEffect: Checking authentication on mount...')
    const checkAuthAndLoad = async () => {
      try {
        // Try to load real data first
        const contactsData = await analyticsService.getContactsAnalytics(dateRange, platformFilter)
        setData(contactsData)
        setLoading(false)
      } catch (err) {
        console.log('✅ User not authenticated or no data - showing sample data immediately')
        // Fall back to sample data from the service
        const sampleData = await analyticsService.getContactsAnalytics(dateRange, platformFilter)
        setData(sampleData)
        setLoading(false)
      }
    }
    
    checkAuthAndLoad()
  }, []) // Only run on mount

  // Separate effect for refreshing data when filters change
  useEffect(() => {
    if (data && !loading) {
      // Only refresh if we already have data
      loadContactsData()
    }
  }, [dateRange, platformFilter])

  const loadContactsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const contactsData = await analyticsService.getContactsAnalytics(dateRange, platformFilter)
      setData(contactsData)
    } catch (err) {
      console.error('Failed to load contacts data:', err)
      setError('Failed to load contacts data')
    } finally {
      setLoading(false)
    }
  }

  const getContactTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Call'
      case 'email': return 'Email/DM'
      case 'resume_request': return 'Resume Request'
      default: return type
    }
  }

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'resume_request': return <FileText className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-green-500'
      case 'email': return 'bg-blue-500'
      case 'resume_request': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'pending': return <Activity className="w-4 h-4 text-yellow-500" />
      case 'closed': return <Target className="w-4 h-4 text-gray-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'closed': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'whatsapp': return <Globe className="w-4 h-4" />
      case 'linkedin': return <Globe className="w-4 h-4" />
      case 'facebook': return <Users className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Contacts Analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Data</h2>
          <p className="text-gray-600 mb-8">
            {error || 'Unknown error occurred'}
            {!data && !loading && ' (No data available)'}
          </p>
          <div className="text-sm text-gray-500 mb-4">
            Debug: loading={loading.toString()}, data={data ? 'present' : 'null'}, error={error || 'none'}
          </div>
          <button
            onClick={loadContactsData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Debug logging
  console.log('🎨 Render state:', { 
    loading, 
    data: !!data, 
    error, 
    dataKeys: data ? Object.keys(data) : [],
    dataTotalContacts: data?.total || 'N/A'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/veteran/admin-style')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Contacts Analytics</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Platforms</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="email">Email</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={loadContactsData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => router.push('/dashboard/veteran/admin-style')}
            className="hover:text-gray-700 transition-colors"
          >
            Admin Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Contacts Analytics</span>
        </nav>

        {/* Hero Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Total Contacts: {data.total.toLocaleString()}</h2>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  {data.change >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className={`text-lg font-medium ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-2">vs previous period</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    View→Contact Rate: {data.viewToContactRate.toFixed(1)}%
                  </span>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Contact→Hire Rate: {data.contactToHireRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-2">📞</div>
              <div className="text-sm text-gray-500">Total Contacts</div>
            </div>
          </div>
        </div>

        {/* 1-Click Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button className="bg-green-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </button>
            
            <button className="bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </button>
            
            <button className="bg-purple-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Request Resume</span>
            </button>
            
            <button className="bg-gray-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
              <Copy className="w-4 h-4" />
              <span>Copy Contact Info</span>
            </button>
            
            <button className="bg-orange-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Contacts</span>
            </button>
          </div>
        </div>

        {/* Contacts Over Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Contacts Over Time</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>All contact events: call, email/DM, resume request</span>
            </div>
          </div>
          
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart: Contacts Over Time</p>
              <p className="text-sm">Line chart showing daily contacts vs previous period</p>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> All contact events: call, email/DM, resume request.
          </div>
        </div>

        {/* Contact Type Split */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Contact Type Split</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <PieChart className="w-4 h-4" />
              <span>Call | Email/DM | Resume Request (counts + %)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.byType.map((type, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${getContactTypeColor(type.type)} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {getContactTypeIcon(type.type)}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{getContactTypeLabel(type.type)}</h4>
                <p className="text-2xl font-bold text-gray-700">{type.count.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{type.percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> Call | Email/DM | Resume Request (counts + %).
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Content</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BarChart3 className="w-4 h-4" />
              <span>Content that drives the most contacts</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topPerformingContent.map((content, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{content.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{content.contacts}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{content.conversionRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{content.lastActivity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                          Optimize
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> Content that drives the most contacts.
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Contacts</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Activity className="w-4 h-4" />
              <span>Latest contact events with details</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {data.recentContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getContactTypeIcon(contact.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{contact.timestamp}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{getContactTypeLabel(contact.type)}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{contact.channel}</span>
                      {contact.supporterName && (
                        <>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-blue-600">via {contact.supporterName}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(contact.status)}
                      <span className={`text-sm font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">Last: {contact.lastActivity}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {contact.supporterName && (
                    <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                      Thank Supporter
                    </button>
                  )}
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <span className="font-medium">Definition:</span> Latest contact events with timestamp, type, channel, supporter name, status, and last activity.
          </div>
        </div>

        {/* Why It Matters */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Why Contacts Matter</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Conversion:</strong> Contacts = actual interest and engagement with your pitch.</p>
                <p><strong>Quality:</strong> Contact type split shows what actions recruiters prefer.</p>
                <p><strong>Attribution:</strong> Track which content and channels drive real engagement.</p>
                <p><strong>ROI:</strong> View→Contact and Contact→Hire rates show your pitch effectiveness.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
