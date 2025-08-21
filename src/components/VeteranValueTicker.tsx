'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Shield, Users, Target, Zap, Star, Award, Briefcase, Globe, Cpu } from 'lucide-react'

interface VeteranValueMessage {
  id: string
  message: string
  category: 'leadership' | 'skills' | 'experience' | 'diversity' | 'success'
  icon: string
  color: string
}

export default function VeteranValueTicker() {
  const [currentMessage, setCurrentMessage] = useState<VeteranValueMessage | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Curated messages that subtly reinforce veteran value without hard selling
  const veteranValueMessages: VeteranValueMessage[] = [
    // Leadership & Management
    {
      id: '1',
      message: 'Veterans bring proven leadership from managing teams in high-pressure environments',
      category: 'leadership',
      icon: 'Shield',
      color: 'text-blue-600'
    },
    {
      id: '2',
      message: 'Military experience includes project management, logistics, and strategic planning',
      category: 'leadership',
      icon: 'Target',
      color: 'text-green-600'
    },
    {
      id: '3',
      message: 'Veterans excel at cross-functional collaboration and team building',
      category: 'leadership',
      icon: 'Users',
      color: 'text-purple-600'
    },

    // Technical & Specialized Skills
    {
      id: '4',
      message: 'Veterans trained in cybersecurity, data analysis, and advanced technology systems',
      category: 'skills',
      icon: 'Cpu',
      color: 'text-indigo-600'
    },
    {
      id: '5',
      message: 'Military experience includes logistics, supply chain, and operations management',
      category: 'skills',
      icon: 'Briefcase',
      color: 'text-orange-600'
    },
    {
      id: '6',
      message: 'Veterans bring expertise in communications, training, and knowledge transfer',
      category: 'skills',
      icon: 'Globe',
      color: 'text-teal-600'
    },

    // Corporate-Relevant Experience
    {
      id: '7',
      message: 'Veterans understand organizational hierarchy and corporate culture',
      category: 'experience',
      icon: 'TrendingUp',
      color: 'text-emerald-600'
    },
    {
      id: '8',
      message: 'Military experience includes budgeting, resource allocation, and cost management',
      category: 'experience',
      icon: 'Target',
      color: 'text-blue-600'
    },
    {
      id: '9',
      message: 'Veterans trained in risk assessment, compliance, and regulatory frameworks',
      category: 'experience',
      icon: 'Shield',
      color: 'text-red-600'
    },

    // Diversity & Global Perspective
    {
      id: '10',
      message: 'Veterans bring diverse perspectives from serving with people from all backgrounds',
      category: 'diversity',
      icon: 'Globe',
      color: 'text-purple-600'
    },
    {
      id: '11',
      message: 'Military experience includes international operations and cultural awareness',
      category: 'diversity',
      icon: 'Users',
      color: 'text-indigo-600'
    },
    {
      id: '12',
      message: 'Veterans understand global markets and international business dynamics',
      category: 'diversity',
      icon: 'Globe',
      color: 'text-green-600'
    },

    // Success Stories & Outcomes
    {
      id: '13',
      message: 'Companies report 40% higher retention rates when hiring veterans',
      category: 'success',
      icon: 'Star',
      color: 'text-yellow-600'
    },
    {
      id: '14',
      message: 'Veterans often excel in customer service and client relationship roles',
      category: 'success',
      icon: 'Award',
      color: 'text-pink-600'
    },
    {
      id: '15',
      message: 'Military training emphasizes adaptability and continuous learning',
      category: 'success',
      icon: 'Zap',
      color: 'text-orange-600'
    }
  ]

  useEffect(() => {
    let currentIndex = 0
    let interval: NodeJS.Timeout

    const showNextMessage = () => {
      const message = veteranValueMessages[currentIndex]
      if (message) {
        setCurrentMessage(message)
        setIsVisible(true)

        // Hide after 6 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 6000)

        // Move to next message
        currentIndex = (currentIndex + 1) % veteranValueMessages.length
      }
    }

    // Show first message after 3 seconds
    const initialTimeout = setTimeout(() => {
      showNextMessage()
      
      // Then cycle every 12 seconds (6 seconds visible + 6 seconds hidden)
      interval = setInterval(showNextMessage, 12000)
    }, 3000)

    return () => {
      clearTimeout(initialTimeout)
      if (interval) clearInterval(interval)
    }
  }, [])

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      TrendingUp,
      Shield,
      Users,
      Target,
      Zap,
      Star,
      Award,
      Briefcase,
      Globe,
      Cpu
    }
    const IconComponent = icons[iconName]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null
  }

  if (!currentMessage) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className={`transform transition-all duration-500 ease-in-out ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${currentMessage.color}`}>
              {getIcon(currentMessage.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentMessage.message}
              </p>
            </div>
          </div>
          
          {/* Subtle category indicator */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                currentMessage.category === 'leadership' ? 'bg-blue-500' :
                currentMessage.category === 'skills' ? 'bg-green-500' :
                currentMessage.category === 'experience' ? 'bg-purple-500' :
                currentMessage.category === 'diversity' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`} />
              <span className="text-xs text-gray-500 capitalize">
                {currentMessage.category}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Veteran Value
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
