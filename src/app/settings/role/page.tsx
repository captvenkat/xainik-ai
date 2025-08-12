'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import RoleSelectionModal from '@/components/RoleSelectionModal'
import { Shield, Building, Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RoleSelectionPage() {
  const [user, setUser] = useState<any>(null)
  const [currentRole, setCurrentRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth')
          return
        }
        
        setUser(user)
        
        // Get current role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setCurrentRole(profile?.role || '')
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [router])

  const handleRoleSelected = (role: string) => {
    setCurrentRole(role)
    setShowModal(false)
    // Redirect to the appropriate dashboard
    router.push(`/dashboard/${role}`)
  }

  const getRoleInfo = (role: string) => {
    const roles = {
      veteran: {
        title: 'Veteran',
        description: 'Military veteran looking for civilian opportunities',
        icon: Shield,
        color: 'bg-blue-500'
      },
      recruiter: {
        title: 'Recruiter',
        description: 'Recruiter looking to hire talented veterans',
        icon: Building,
        color: 'bg-green-500'
      },
      supporter: {
        title: 'Supporter',
        description: 'Supporting veterans in their career transition',
        icon: Heart,
        color: 'bg-purple-500'
      }
    }
    return roles[role as keyof typeof roles]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const roleInfo = currentRole ? getRoleInfo(currentRole) : null
  const IconComponent = roleInfo?.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/settings" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Role Selection
          </h1>
          <p className="text-gray-600">
            Choose your role on the XAINIK platform
          </p>
        </div>

        {/* Current Role */}
        {currentRole && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Role
            </h2>
            <div className="flex items-center">
              {IconComponent && (
                <div className={`${roleInfo?.color} p-3 rounded-lg mr-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {roleInfo?.title}
                </h3>
                <p className="text-gray-600">
                  {roleInfo?.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Change Role */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentRole ? 'Change Your Role' : 'Select Your Role'}
          </h2>
          <p className="text-gray-600 mb-6">
            {currentRole 
              ? 'You can change your role at any time. This will update your dashboard and available features.'
              : 'Please select your role to continue using the platform.'
            }
          </p>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {currentRole ? 'Change Role' : 'Select Role'}
          </button>
        </div>

        {/* Role Selection Modal */}
        <RoleSelectionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onRoleSelected={handleRoleSelected}
          userEmail={user.email}
        />
      </div>
    </div>
  )
}
