'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react'

interface ResumeUploadProps {
  onResumeUpload: (file: File) => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export default function ResumeUpload({
  onResumeUpload,
  isLoading = false,
  disabled = false,
  className = ''
}: ResumeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedFileTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff'
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    // Check file size
    if (file.size > maxFileSize) {
      alert('File size must be less than 10MB')
      return
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff']
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert('Please select a valid file type: PDF, DOC, DOCX, or image files (JPG, PNG, GIF, BMP, TIFF)')
      return
    }

    setSelectedFile(file)
    onResumeUpload(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop()
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(extension || '')) {
      return <Image className="w-5 h-5" />
    }
    return <FileText className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="text-center">
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile.name)}
                  <span className="font-medium text-gray-900">{selectedFile.name}</span>
                </div>
                <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Your Resume
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your resume here, or click to browse
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  PDF, DOC, DOCX
                </span>
                <span className="flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  Images
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* File Info */}
      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded">
              {getFileIcon(selectedFile.name)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Resume Uploaded Successfully</h4>
              <p className="text-sm text-blue-700 mt-1">
                {selectedFile.name} • {formatFileSize(selectedFile.size)}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Xainik AI will analyze your resume to extract relevant experience and skills.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Supported File Types:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• <strong>Documents:</strong> PDF, DOC, DOCX (up to 10MB)</li>
              <li>• <strong>Images:</strong> JPG, PNG, GIF, BMP, TIFF (up to 10MB)</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              For best results, use clear, high-quality documents or images of your resume.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
