'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Shield, Users, Building, Heart } from 'lucide-react'

interface RoleSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onRoleSelected: (role: string) => void
  userEmail?: string
}

const roles = [
  {
    id: 'recruiter',
    title: 'Recruiter',
    description: 'I am a recruiter looking to hire talented veterans',
    icon: Building,
    color: 'bg-green-500',
    features: ['Browse veteran pitches', 'Request resumes', 'Post job opportunities']
  },
  {
    id: 'supporter',
    title: 'Supporter',
    description: 'I want to support veterans in their career transition',
    icon: Heart,
    color: 'bg-purple-500',
    features: ['Endorse veterans', 'Share opportunities', 'Provide mentorship']
  }
]

export default function RoleSelectionModal({ isOpen, onClose, onRoleSelected, userEmail }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleRoleSelect = async (role: string) => {
    setSelectedRole(role)
    setIsLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Create or update user record with selected role
      const userData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || 
               user.user_metadata?.name || 
               user.email?.split('@')[0] || 'User',
        phone: '', // Required field
        role: role,
        location: '', // Required field
        military_branch: '', // Required field
        military_rank: '', // Required field
        years_of_service: 0, // Required field
        discharge_date: null, // Required field - null for new users
        education_level: '', // Required field
        certifications: null, // Required field
        bio: '', // Required field
        avatar_url: null, // Required field
        is_active: true, // Required field
        email_verified: false, // Required field
        phone_verified: false, // Required field
        last_login_at: null, // Required field
        metadata: {} // Required field
      };

      console.log('Creating user with data:', userData);

      const { error } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'id'
        })

      if (error) {
        throw error
      }

      // Call the callback with selected role
      onRoleSelected(role)
    } catch (error) {
      console.error('Error setting user role:', error)
      alert('Failed to set role. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render anything on the server side
  if (!isClient || !isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to XAINIK!
            </h2>
            <p className="text-gray-600">
              {userEmail ? `Signed in as ${userEmail}` : 'Please select your role to continue'}
            </p>
          </div>

          {/* Veteran Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Are you a Military Veteran?
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  Veterans should join our exclusive waitlist for priority access and special benefits.
                </p>
                <a 
                  href="/waitlist" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Join Veteran Waitlist →
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => {
              const IconComponent = role.icon
              return (
                <div
                  key={role.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === role.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !isLoading && handleRoleSelect(role.id)}
                >
                  <div className="flex items-center mb-3">
                    <div className={`${role.color} p-2 rounded-lg mr-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {role.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {role.description}
                  </p>
                  
                  <ul className="text-xs text-gray-500 space-y-1">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {isLoading && (
            <div className="text-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Setting up your account...</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
              disabled={isLoading}
            >
              I'll choose later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
