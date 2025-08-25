'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, Share2, MessageCircle, TrendingUp, TrendingDown, 
  Users, ArrowDownRight, Phone, Mail, FileText, Globe,
  Calendar, ChevronDown, Heart, BarChart3, PieChart,
  MoreHorizontal, Plus, Filter, Download, RefreshCw,
  CheckCircle, Clock, AlertCircle, Edit, Link, Copy
} from 'lucide-react'

export default function UnifiedProgressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  // Mock data
  const mockData = {
    kpis: {
      shares: { value: 45, change: 15.2, trend: 'up' },
      views: { value: 128, change: 8.7, trend: 'up' },
      contacts: { value: 12, change: -3.1, trend: 'down' }
    },
    funnel: [
      { stage: 'Shares', count: 45, dropRate: 0 },
      { stage: 'Views', count: 128, dropRate: -184 },
      { stage: 'Contacts', count: 12, dropRate: 90.6 }
    ],
    supporters: [
      { name: 'Col. Ramesh Kumar', avatar: 'RK', shares: 8, views: 24, contacts: 3, lastActive: '2h ago' },
      { name: 'Lt. Priya Singh', avatar: 'PS', shares: 6, views: 18, contacts: 2, lastActive: '5h ago' },
      { name: 'Open Network', avatar: 'ON', shares: 12, views: 35, contacts: 4, lastActive: '1h ago' }
    ],
    channels: [
      { name: 'WhatsApp', shares: 18, views: 52, contacts: 5, efficiency: 2.9 },
      { name: 'LinkedIn', shares: 12, views: 38, contacts: 4, efficiency: 3.2 },
      { name: 'Facebook', shares: 8, views: 22, contacts: 2, efficiency: 2.8 },
      { name: 'Email', shares: 5, views: 12, contacts: 1, efficiency: 2.4 },
      { name: 'Twitter', shares: 2, views: 4, contacts: 0, efficiency: 2.0 }
    ],
    contacts: [
      { id: 1, type: 'call', channel: 'WhatsApp', supporter: 'Col. Ramesh Kumar', timeSince: '45m', status: 'open' },
      { id: 2, type: 'email', channel: 'LinkedIn', supporter: 'Lt. Priya Singh', timeSince: '2h', status: 'responded' },
      { id: 3, type: 'resume', channel: 'Email', supporter: 'Open Network', timeSince: '1h', status: 'open' }
    ],
    suggestions: [
      { title: '12 recruiters viewed but only 2 contacted', action: 'Send Follow-Up', type: 'primary' },
      { title: 'Col. Ramesh drove 10 views', action: 'Send Thank You', type: 'success' }
    ]
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">Unified Progress Dashboard</h1>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Time Period</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="14d">Last 14 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="60d">Last 60 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              <button
                onClick={() => router.push('/pitch/new/ai-first')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Edit Pitch
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Shares</h3>
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{mockData.kpis.shares.value}</div>
                <div className="flex items-center text-sm">
                  {mockData.kpis.shares.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={mockData.kpis.shares.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {mockData.kpis.shares.trend === 'up' ? '+' : ''}{mockData.kpis.shares.change}%
                  </span>
                  <span className="text-gray-500 ml-2">vs last period</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Views</h3>
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{mockData.kpis.views.value}</div>
                <div className="flex items-center text-sm">
                  {mockData.kpis.views.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={mockData.kpis.views.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {mockData.kpis.views.trend === 'up' ? '+' : ''}{mockData.kpis.views.change}%
                  </span>
                  <span className="text-gray-500 ml-2">vs last period</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{mockData.kpis.contacts.value}</div>
                <div className="flex items-center text-sm">
                  {mockData.kpis.contacts.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={mockData.kpis.contacts.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {mockData.kpis.contacts.trend === 'up' ? '+' : ''}{mockData.kpis.contacts.change}%
                  </span>
                  <span className="text-gray-500 ml-2">vs last period</span>
                </div>
              </div>
            </div>

            {/* Progress Funnel */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Funnel</h3>
              <div className="flex items-center justify-between">
                {mockData.funnel.map((stage, index) => (
                  <div key={stage.stage} className="flex-1 text-center">
                    <div className="bg-blue-100 rounded-lg p-4 mb-2">
                      <div className="text-2xl font-bold text-blue-600">{stage.count}</div>
                      <div className="text-sm text-gray-600">{stage.stage}</div>
                      {stage.dropRate !== 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {stage.dropRate > 0 ? '+' : ''}{stage.dropRate}% drop
                        </div>
                      )}
                    </div>
                    {index < mockData.funnel.length - 1 && (
                      <div className="flex justify-center">
                        <ArrowDownRight className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Supporter Spotlight */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Supporter Spotlight</h3>
              <div className="space-y-4">
                {mockData.supporters.map((supporter, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{supporter.avatar}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{supporter.name}</div>
                        <div className="text-sm text-gray-500">
                          {supporter.shares} shares • {supporter.views} views • {supporter.contacts} contacts
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500">{supporter.lastActive}</span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Thank</button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ask Again</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel Insights */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Channel Insights</h3>
              <div className="space-y-4">
                {mockData.channels.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Globe className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{channel.name}</div>
                        <div className="text-sm text-gray-500">
                          {channel.shares} shares • {channel.views} views • {channel.contacts} contacts
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{channel.efficiency.toFixed(1)}x</div>
                      <div className="text-sm text-gray-500">efficiency</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Outcomes */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Outcomes</h3>
              <div className="space-y-4">
                {mockData.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        {contact.type === 'call' && <Phone className="w-4 h-4 text-purple-600" />}
                        {contact.type === 'email' && <Mail className="w-4 h-4 text-purple-600" />}
                        {contact.type === 'resume' && <FileText className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{contact.type} via {contact.channel}</div>
                        <div className="text-sm text-gray-500">
                          {contact.supporter} • {contact.timeSince} since view
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contact.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        contact.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Follow Up</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Suggestions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Suggestions</h3>
              <div className="space-y-4">
                {mockData.suggestions.map((suggestion, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    suggestion.type === 'primary' ? 'bg-blue-50' : 'bg-green-50'
                  }`}>
                    <div className={`text-sm font-medium mb-2 ${
                      suggestion.type === 'primary' ? 'text-blue-900' : 'text-green-900'
                    }`}>
                      {suggestion.title}
                    </div>
                    <button className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                      suggestion.type === 'primary' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}>
                      {suggestion.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
