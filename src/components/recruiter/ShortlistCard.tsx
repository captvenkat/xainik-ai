'use client'

import { useState } from 'react'
import { Phone, Mail, Eye, Star, Clock, Calendar, MapPin, Briefcase, Zap } from 'lucide-react'
import Link from 'next/link'

interface ShortlistCardProps {
  shortlistItem: {
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
  onStatusChange: (id: string, status: string) => void
  onContact: (pitchId: string, contactType: 'call' | 'email') => void
}

export default function ShortlistCard({ shortlistItem, onStatusChange, onContact }: ShortlistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'interviewed': return 'bg-purple-100 text-purple-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Immediate': return 'text-green-600'
      case '30': return 'text-yellow-600'
      case '60': return 'text-orange-600'
      case '90': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {shortlistItem.pitch.photo_url ? (
              <img 
                src={shortlistItem.pitch.photo_url} 
                alt={shortlistItem.pitch.veteran.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {shortlistItem.pitch.veteran.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{shortlistItem.pitch.veteran.name}</h3>
              <p className="text-sm text-gray-600">{shortlistItem.pitch.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Shortlisted
            </span>
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          </div>
        </div>

        {/* Skills */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {shortlistItem.pitch.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{shortlistItem.pitch.location.split(',')[0]}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span className={getAvailabilityColor(shortlistItem.pitch.availability)}>
              {shortlistItem.pitch.availability === 'Immediate' ? 'Available Now' : `${shortlistItem.pitch.availability} days`}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => onContact(shortlistItem.pitch.id, 'call')}
              className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              <Phone className="w-4 h-4 mr-1" />
              Call
            </button>
            <button
              onClick={() => onContact(shortlistItem.pitch.id, 'email')}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </button>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/pitch/${shortlistItem.pitch.id}`}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Link>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center px-2 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
                                            {/* Contact Info */}
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-gray-500">Phone:</span>
                   <p className="font-medium">{shortlistItem.pitch.phone}</p>
                 </div>
                 <div>
                   <span className="text-gray-500">Email:</span>
                   <p className="font-medium">{shortlistItem.pitch.veteran.email}</p>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
