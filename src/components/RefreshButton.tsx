'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { refreshAnalytics } from '@/lib/actions/analytics'

interface RefreshButtonProps {
  userId: string
  role: string
  path: string
  className?: string
}

export default function RefreshButton({ userId, role, path, className = '' }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshAnalytics(userId, role, path)
      setLastRefreshed(new Date())
      
      // Show success feedback
      const button = document.querySelector(`[data-refresh-button="${userId}"]`) as HTMLElement
      if (button) {
        button.classList.add('bg-green-100', 'text-green-700')
        setTimeout(() => {
          button.classList.remove('bg-green-100', 'text-green-700')
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to refresh analytics:', error)
      // Show error feedback
      const button = document.querySelector(`[data-refresh-button="${userId}"]`) as HTMLElement
      if (button) {
        button.classList.add('bg-red-100', 'text-red-700')
        setTimeout(() => {
          button.classList.remove('bg-red-100', 'text-red-700')
        }, 2000)
      }
    } finally {
      setIsRefreshing(false)
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <button
        data-refresh-button={userId}
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
          isRefreshing
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
        } ${className}`}
        title="Refresh analytics data"
      >
        <RefreshCw 
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
      
      {lastRefreshed && (
        <div className="text-xs text-gray-500">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
