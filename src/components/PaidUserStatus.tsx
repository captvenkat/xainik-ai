'use client'

import { Crown, CheckCircle, Calendar, TrendingUp, Users, Star } from 'lucide-react'

interface PaidUserStatusProps {
  userPlan: string
  daysUntilExpiry?: number | null
  onManageSubscription?: () => void
}

export default function PaidUserStatus({ userPlan, daysUntilExpiry, onManageSubscription }: PaidUserStatusProps) {
  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'trial_14':
        return {
          name: '14-Day Trial',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Crown,
          features: ['Full pitch visibility', 'Recruiter contact', 'Analytics dashboard', 'Email support']
        }
      case 'plan_30':
        return {
          name: '30-Day Plan',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Star,
          features: ['Full pitch visibility', 'Recruiter contact', 'Analytics dashboard', 'Email support', 'Resume request feature']
        }
      case 'plan_60':
        return {
          name: '60-Day Plan',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: TrendingUp,
          features: ['Full pitch visibility', 'Recruiter contact', 'Analytics dashboard', 'Email support', 'Resume request feature', 'Featured placement']
        }
      case 'plan_90':
        return {
          name: '90-Day Plan',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Crown,
          features: ['Full pitch visibility', 'Recruiter contact', 'Analytics dashboard', 'Email support', 'Resume request feature', 'Featured placement', 'Direct messaging']
        }
      default:
        return {
          name: 'Active Plan',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Crown,
          features: ['Full platform access']
        }
    }
  }

  const planInfo = getPlanInfo(userPlan)
  const IconComponent = planInfo.icon

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Active Subscription
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              You have full access to all platform features
            </p>
          </div>
        </div>
        
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${planInfo.color}`}>
          {planInfo.name}
        </span>
      </div>

      {/* Plan Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Status</h3>
          </div>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Expires In</h3>
          </div>
          <p className="text-sm text-gray-600">
            {daysUntilExpiry !== null && daysUntilExpiry !== undefined && daysUntilExpiry > 0 
              ? `${daysUntilExpiry} days`
              : 'Active'
            }
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Access</h3>
          </div>
          <p className="text-sm text-gray-600">Full Platform</p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg p-4 border border-green-200">
        <h3 className="font-semibold text-gray-900 mb-3">Your Plan Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {planInfo.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="mt-6 pt-6 border-t border-green-200">
        <div className="bg-white rounded-lg p-4 border border-green-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Manage Subscription</h3>
              <p className="text-sm text-gray-600 mt-1">
                View billing history or upgrade your plan
              </p>
            </div>
            <button
              onClick={onManageSubscription}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Manage Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
