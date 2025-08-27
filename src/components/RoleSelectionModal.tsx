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

      // Create or update profile record with selected role
      const profileData = {
        id: user.id,
        role: role,
        onboarding_complete: role === 'veteran' ? false : true
      };

      console.log('Creating profile with data:', profileData);

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
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
