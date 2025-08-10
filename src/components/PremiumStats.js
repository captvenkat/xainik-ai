'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Award, Star } from 'lucide-react'

export default function PremiumStats() {
  const [stats, setStats] = useState({
    veterans: 0,
    companies: 0,
    successRate: 0,
    avgTime: 0
  })

  const targetStats = {
    veterans: 2847,
    companies: 156,
    successRate: 94,
    avgTime: 3.2
  }

  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000 // 2 seconds
      const steps = 60
      const stepDuration = duration / steps

      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        setStats({
          veterans: Math.floor(targetStats.veterans * progress),
          companies: Math.floor(targetStats.companies * progress),
          successRate: Math.floor(targetStats.successRate * progress),
          avgTime: Number((targetStats.avgTime * progress).toFixed(1))
        })

        if (currentStep >= steps) {
          clearInterval(interval)
          setStats(targetStats)
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }

    // Start animation after a short delay
    const timer = setTimeout(animateCounters, 500)
    return () => clearTimeout(timer)
  }, [])

  const statItems = [
    {
      icon: Users,
      value: stats.veterans.toLocaleString(),
      label: 'Veterans Hired',
      color: 'bg-gradient-primary',
      bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50'
    },
    {
      icon: TrendingUp,
      value: `${stats.successRate}%`,
      label: 'Success Rate',
      color: 'bg-gradient-success',
      bgColor: 'bg-gradient-to-br from-green-50 to-teal-50'
    },
    {
      icon: Award,
      value: stats.companies,
      label: 'Partner Companies',
      color: 'bg-gradient-resume',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50'
    },
    {
      icon: Star,
      value: `${stats.avgTime} weeks`,
      label: 'Avg. Time to Hire',
      color: 'bg-gradient-refer',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50'
    }
  ]

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container-premium">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
            <TrendingUp className="h-4 w-4" />
            Platform Statistics
          </div>
          <h2 className="heading-large mb-4">
            Trusted by Veterans & Companies
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our platform has successfully connected thousands of veterans with meaningful career opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((item, index) => (
            <div key={index} className="group">
              <div className={`relative overflow-hidden ${item.bgColor} rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                {/* Decorative background */}
                <div className={`absolute top-0 right-0 w-24 h-24 ${item.color} rounded-full opacity-10 -translate-y-8 translate-x-8`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Value */}
                  <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {item.value}
                  </div>

                  {/* Label */}
                  <div className="text-sm text-gray-600 font-medium">
                    {item.label}
                  </div>

                  {/* Animated underline */}
                  <div className={`mt-3 h-1 ${item.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live updates</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Real-time data</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Verified metrics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
