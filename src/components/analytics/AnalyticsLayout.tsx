"use client"

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  ArrowLeft, 
  RefreshCw,
  Calendar,
  Info
} from 'lucide-react'

interface AnalyticsLayoutProps {
  title: string
  description: string
  children: ReactNode
  onDataLoad: (dateRange: string, platformFilter: string) => Promise<any>
  generateSampleData: () => any
  breadcrumbPath?: string
}

export default function AnalyticsLayout({
  title,
  description,
  children,
  onDataLoad,
  generateSampleData,
  breadcrumbPath = '/dashboard/veteran/admin-style'
}: AnalyticsLayoutProps) {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  useEffect(() => {
    // Check authentication status immediately (only on mount)
    console.log(`🔍 AnalyticsLayout: Checking authentication for ${title}...`)
    const checkAuthAndLoad = async () => {
      const supabase = createSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log(`🔍 Auth check result for ${title}:`, { user: !!user, userId: user?.id })
      
      if (!user) {
        // User not authenticated - show sample data immediately
        console.log(`✅ User not authenticated - showing sample data for ${title}`)
        const sampleData = generateSampleData()
        setData(sampleData)
        setLoading(false)
        return
      }
      
      // User is authenticated - load real data
      console.log(`🔐 User authenticated - loading real data for ${title}`)
      loadAnalyticsData()
    }
    
    checkAuthAndLoad()
  }, []) // Only run on mount

  // Separate effect for refreshing data when filters change
  useEffect(() => {
    if (data && !loading) {
      // Only refresh if we already have data and user is authenticated
      const refreshData = async () => {
        const supabase = createSupabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          loadAnalyticsData()
        }
      }
      refreshData()
    }
  }, [dateRange, platformFilter])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const analyticsData = await onDataLoad(dateRange, platformFilter)
      setData(analyticsData)
    } catch (err) {
      console.error(`Failed to load ${title.toLowerCase()} data:`, err)
      // On any error, fall back to sample data
      setData(generateSampleData())
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {title}...</p>
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
            onClick={loadAnalyticsData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push(breadcrumbPath)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
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
                onClick={loadAnalyticsData}
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
            onClick={() => router.push(breadcrumbPath)}
            className="hover:text-gray-700 transition-colors"
          >
            Admin Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{title}</span>
        </nav>

        {/* Page Description */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">{description}</p>
            </div>
          </div>
        </div>

        {/* Render the specific analytics content */}
        {children}
      </div>
    </div>
  )
}
