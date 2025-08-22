'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, Crop, User, X, Check } from 'lucide-react'
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface PhotoUploadProps {
  profilePhotoUrl?: string | null
  onPhotoChange: (photoUrl: string, isCustom: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showCrop?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export default function PhotoUpload({ 
  profilePhotoUrl, 
  onPhotoChange, 
  className = '',
  size = 'md',
  showCrop = true,
  disabled = false,
  readOnly = false
}: PhotoUploadProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [isCustomPhoto, setIsCustomPhoto] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedPhoto(result)
        setIsCustomPhoto(true)
        if (showCrop) {
          setShowCropper(true)
        } else {
          onPhotoChange(result, true)
        }
      }
      reader.readAsDataURL(file)
    }
  }, [onPhotoChange, showCrop])

  const handleCropComplete = useCallback((crop: PixelCrop) => {
    setCompletedCrop(crop)
  }, [])

  const handleCropSave = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

    canvas.width = completedCrop.width
    canvas.height = completedCrop.height

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
    setSelectedPhoto(croppedImageUrl)
    setShowCropper(false)
    onPhotoChange(croppedImageUrl, true)
  }, [completedCrop, onPhotoChange])

  const handleUseProfilePhoto = useCallback(() => {
    if (profilePhotoUrl) {
      setSelectedPhoto(profilePhotoUrl)
      setIsCustomPhoto(false)
      onPhotoChange(profilePhotoUrl, false)
    }
  }, [profilePhotoUrl, onPhotoChange])

  const handleRemovePhoto = useCallback(() => {
    setSelectedPhoto(null)
    setIsCustomPhoto(false)
    onPhotoChange('', false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onPhotoChange])

  const currentPhotoUrl = selectedPhoto || profilePhotoUrl

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Photo Display */}
      <div className="flex items-center justify-center">
        <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200`}>
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt="Profile photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-1/2 h-1/2 text-gray-400" />
            </div>
          )}
          
          {/* Photo Status Indicator */}
          {isCustomPhoto && (
            <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
              <Camera className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Photo Actions */}
      <div className="flex flex-col gap-2 min-w-[120px]">
        {/* Upload New Photo */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || readOnly}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            disabled || readOnly 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Photo
        </button>

        {/* Use Profile Photo */}
        {profilePhotoUrl && !isCustomPhoto && (
          <button
            onClick={handleUseProfilePhoto}
            disabled={disabled || readOnly}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
              disabled || readOnly 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Use Profile Photo
          </button>
        )}

        {/* Remove Photo */}
        {currentPhotoUrl && (
          <button
            onClick={handleRemovePhoto}
            disabled={disabled || readOnly}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
              disabled || readOnly 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <X className="w-4 h-4" />
            Remove Photo
        </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Photo Source Info */}
      {currentPhotoUrl && (
        <div className="text-sm text-gray-600 text-center">
          {isCustomPhoto ? (
            <span className="flex items-center justify-center gap-1">
              <Camera className="w-4 h-4" />
              Custom photo uploaded
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <User className="w-4 h-4" />
              Using profile photo
            </span>
          )}
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Crop Your Photo</h3>
              <button
                onClick={() => setShowCropper(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Cropper Content */}
            <div className="p-6">
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={handleCropComplete}
                  aspect={1}
                  circularCrop
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={selectedPhoto}
                    alt="Crop preview"
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
              
              {/* Instructions */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Drag to adjust the crop area. The image will be cropped to a perfect circle.
                </p>
              </div>
            </div>
            
            {/* Footer with Buttons */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowCropper(false)}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Check className="w-4 h-4" />
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
