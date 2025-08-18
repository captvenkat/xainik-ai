'use client'

import { useState, useEffect } from 'react'
import PhotoUpload from './PhotoUpload'
import { Camera, User, Info } from 'lucide-react'

interface SmartPhotoManagerProps {
  profilePhotoUrl?: string | null
  pitchPhotoUrl?: string | null
  onPhotoChange: (photoUrl: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function SmartPhotoManager({
  profilePhotoUrl,
  pitchPhotoUrl,
  onPhotoChange,
  className = '',
  size = 'md'
}: SmartPhotoManagerProps) {
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [photoSource, setPhotoSource] = useState<'profile' | 'custom' | 'none'>('none')

  // Initialize with existing pitch photo or fallback to profile photo
  useEffect(() => {
    if (pitchPhotoUrl) {
      setCurrentPhoto(pitchPhotoUrl)
      setPhotoSource('custom')
    } else if (profilePhotoUrl) {
      setCurrentPhoto(profilePhotoUrl)
      setPhotoSource('profile')
    } else {
      setCurrentPhoto(null)
      setPhotoSource('none')
    }
  }, [pitchPhotoUrl, profilePhotoUrl])

  const handlePhotoChange = (photoUrl: string, isCustom: boolean) => {
    setCurrentPhoto(photoUrl || null)
    const source = photoUrl ? (isCustom ? 'custom' : 'profile') : 'none'
    setPhotoSource(source)
    // Only pass the photoUrl to the parent
    onPhotoChange(photoUrl)
  }

  const getPhotoSourceInfo = () => {
    switch (photoSource) {
      case 'profile':
        return {
          icon: User,
          text: 'Using profile photo',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case 'custom':
        return {
          icon: Camera,
          text: 'Custom pitch photo',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      default:
        return {
          icon: Info,
          text: 'No photo selected',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const sourceInfo = getPhotoSourceInfo()
  const IconComponent = sourceInfo.icon

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Smart Photo Display */}
      <div className="space-y-3">
        <PhotoUpload
          profilePhotoUrl={profilePhotoUrl}
          onPhotoChange={handlePhotoChange}
          size={size}
          showCrop={true}
        />
        
        {/* Photo Source Indicator */}
        {currentPhoto && (
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${sourceInfo.bgColor}`}>
            <IconComponent className={`w-4 h-4 ${sourceInfo.color}`} />
            <span className={`text-sm font-medium ${sourceInfo.color}`}>
              {sourceInfo.text}
            </span>
          </div>
        )}
      </div>

      {/* Smart Photo Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Smart Photo Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Profile photo is used by default for consistency</li>
          <li>• Upload a custom photo for role-specific branding</li>
          <li>• Use the crop tool to focus on your face</li>
          <li>• Professional headshots work best</li>
        </ul>
      </div>

      {/* Photo Strategy */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Photo Strategy</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Profile Photo:</strong> Consistent across all pitches, shows your professional identity
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Camera className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Custom Photo:</strong> Role-specific, can be tailored for different job types
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
