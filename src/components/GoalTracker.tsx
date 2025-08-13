'use client'

import { useState, useEffect } from 'react'
import { Target, Trophy, Star, TrendingUp, Calendar, CheckCircle, XCircle, Clock, Zap, Award, Gift, Eye, Users } from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: string
  category: 'visibility' | 'engagement' | 'conversion' | 'networking' | 'skill'
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'overdue'
  streak: number
  rewards: string[]
  milestones: Array<{
    target: number
    reward: string
    achieved: boolean
  }>
}

interface GoalTrackerProps {
  userId: string
  currentMetrics: {
    views: number
    calls: number
    emails: number
    endorsements: number
    shares: number
  }
}

export default function GoalTracker({ userId, currentMetrics }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | Goal['category']>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [userLevel, setUserLevel] = useState(1)
  const [experiencePoints, setExperiencePoints] = useState(0)
  const [achievements, setAchievements] = useState<string[]>([])

  useEffect(() => {
    // Initialize default goals based on current metrics
    initializeGoals()
    calculateUserProgress()
  }, [currentMetrics])

  const initializeGoals = () => {
    const defaultGoals: Goal[] = [
      {
        id: '1',
        title: 'Visibility Champion',
        description: 'Reach 100 pitch views',
        target: 100,
        current: currentMetrics?.views || 0,
        unit: 'views',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'visibility',
        priority: 'high',
        status: (currentMetrics?.views || 0) >= 100 ? 'completed' : 'active',
        streak: 0,
        rewards: ['Profile Badge', '50 XP', 'Featured Listing'],
        milestones: [
                  { target: 25, reward: '25 XP', achieved: (currentMetrics?.views || 0) >= 25 },
        { target: 50, reward: '50 XP', achieved: (currentMetrics?.views || 0) >= 50 },
        { target: 100, reward: '100 XP + Badge', achieved: (currentMetrics?.views || 0) >= 100 }
        ]
      },
      {
        id: '2',
        title: 'Engagement Expert',
        description: 'Achieve 20% conversion rate',
        target: 20,
        current: (currentMetrics?.views || 0) > 0 ? (((currentMetrics?.calls || 0) + (currentMetrics?.emails || 0)) / (currentMetrics?.views || 1)) * 100 : 0,
        unit: '%',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'conversion',
        priority: 'high',
        status: (currentMetrics?.views || 0) > 0 && (((currentMetrics?.calls || 0) + (currentMetrics?.emails || 0)) / (currentMetrics?.views || 1)) * 100 >= 20 ? 'completed' : 'active',
        streak: 0,
        rewards: ['Conversion Badge', '75 XP', 'Priority in Search'],
        milestones: [
                  { target: 5, reward: '25 XP', achieved: (currentMetrics?.views || 0) > 0 && (((currentMetrics?.calls || 0) + (currentMetrics?.emails || 0)) / (currentMetrics?.views || 1)) * 100 >= 5 },
        { target: 10, reward: '50 XP', achieved: (currentMetrics?.views || 0) > 0 && (((currentMetrics?.calls || 0) + (currentMetrics?.emails || 0)) / (currentMetrics?.views || 1)) * 100 >= 10 },
        { target: 20, reward: '75 XP + Badge', achieved: (currentMetrics?.views || 0) > 0 && (((currentMetrics?.calls || 0) + (currentMetrics?.emails || 0)) / (currentMetrics?.views || 1)) * 100 >= 20 }
        ]
      },
      {
        id: '3',
        title: 'Network Builder',
        description: 'Get 10 endorsements',
        target: 10,
        current: currentMetrics?.endorsements || 0,
        unit: 'endorsements',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'networking',
        priority: 'medium',
        status: (currentMetrics?.endorsements || 0) >= 10 ? 'completed' : 'active',
        streak: 0,
        rewards: ['Network Badge', '100 XP', 'Community Recognition'],
        milestones: [
                  { target: 3, reward: '25 XP', achieved: (currentMetrics?.endorsements || 0) >= 3 },
        { target: 7, reward: '50 XP', achieved: (currentMetrics?.endorsements || 0) >= 7 },
        { target: 10, reward: '100 XP + Badge', achieved: (currentMetrics?.endorsements || 0) >= 10 }
        ]
      },
      {
        id: '4',
        title: 'Share Master',
        description: 'Share pitch 50 times',
        target: 50,
        current: currentMetrics?.shares || 0,
        unit: 'shares',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'visibility',
        priority: 'medium',
        status: (currentMetrics?.shares || 0) >= 50 ? 'completed' : 'active',
        streak: 0,
        rewards: ['Share Badge', '60 XP', 'Viral Potential'],
        milestones: [
                  { target: 15, reward: '25 XP', achieved: (currentMetrics?.shares || 0) >= 15 },
        { target: 30, reward: '35 XP', achieved: (currentMetrics?.shares || 0) >= 30 },
        { target: 50, reward: '60 XP + Badge', achieved: (currentMetrics?.shares || 0) >= 50 }
        ]
      }
    ]

    setGoals(defaultGoals)
  }

  const calculateUserProgress = () => {
    // Calculate XP based on achievements
    let totalXP = 0
    const earnedAchievements: string[] = []

    goals.forEach(goal => {
      goal.milestones.forEach(milestone => {
        if (milestone.achieved) {
          const xp = parseInt(milestone.reward.match(/(\d+) XP/)?.[1] || '0')
          totalXP += xp
          
          if (milestone.reward.includes('Badge')) {
            earnedAchievements.push(goal.title.replace(/\s+/g, '') + 'Badge')
          }
        }
      })
    })

    setExperiencePoints(totalXP)
    setUserLevel(Math.floor(totalXP / 100) + 1)
    setAchievements(earnedAchievements)
  }

  const getProgressPercentage = (goal: Goal) => {
    return Math.min(100, (goal.current / goal.target) * 100)
  }

  const getProgressColor = (goal: Goal) => {
    const percentage = getProgressPercentage(goal)
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-blue-500'
    return 'bg-gray-300'
  }

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'visibility':
        return <Eye className="w-4 h-4" />
      case 'engagement':
        return <TrendingUp className="w-4 h-4" />
      case 'conversion':
        return <Target className="w-4 h-4" />
      case 'networking':
        return <Users className="w-4 h-4" />
      case 'skill':
        return <Star className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const filteredGoals = goals.filter(goal => {
    if (selectedCategory !== 'all' && goal.category !== selectedCategory) return false
    if (!showCompleted && goal.status === 'completed') return false
    return true
  })

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const overdueGoals = goals.filter(g => g.status === 'overdue')

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header with User Level & XP */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-900">Goal Tracker & Achievements</h3>
          </div>
          <div className="flex items-center gap-4">
            {/* User Level */}
            <div className="text-center">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-bold text-gray-900">Level {userLevel}</span>
              </div>
              <div className="text-sm text-gray-600">Veteran</div>
            </div>
            
            {/* Experience Points */}
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{experiencePoints} XP</div>
              <div className="text-sm text-gray-600">Experience</div>
            </div>
          </div>
        </div>

        {/* Progress Bar to Next Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress to Level {userLevel + 1}</span>
            <span>{experiencePoints % 100}/100 XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(experiencePoints % 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{activeGoals.length}</div>
            <div className="text-sm text-blue-600">Active</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{completedGoals.length}</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{overdueGoals.length}</div>
            <div className="text-sm text-red-600">Overdue</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{achievements.length}</div>
            <div className="text-sm text-purple-600">Badges</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            {['visibility', 'engagement', 'conversion', 'networking', 'skill'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as Goal['category'])}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Show Completed Toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-600">Show completed</span>
          </label>
        </div>
      </div>

      {/* Goals List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredGoals.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredGoals.map((goal) => (
              <div key={goal.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Goal Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getCategoryIcon(goal.category)}
                  </div>
                  
                  {/* Goal Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{goal.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress: {goal.current} / {goal.target} {goal.unit}</span>
                        <span>{Math.round(getProgressPercentage(goal))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal)}`}
                          style={{ width: `${getProgressPercentage(goal)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Milestones */}
                    <div className="flex items-center gap-4 mb-3">
                      {goal.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            milestone.achieved ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className={`text-xs ${
                            milestone.achieved ? 'text-green-600 font-medium' : 'text-gray-500'
                          }`}>
                            {milestone.target} {goal.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Rewards */}
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Rewards: {goal.rewards.join(', ')}</span>
                    </div>
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(goal.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No goals found</p>
            <p className="text-sm text-gray-400">Create your first goal to get started</p>
          </div>
        )}
      </div>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">Recent Achievements</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement, index) => (
              <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                🏆 {achievement}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
