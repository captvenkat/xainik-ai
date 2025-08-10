'use client'

import { useState, useRef } from 'react'
import { generateAIPitch } from '@/lib/openai'
import { validateLinkedInUrl } from '@/lib/validators'
import { Upload, FileText, Link, Edit3, Loader2 } from 'lucide-react'

interface AIPitchHelperProps {
  formData: any
  updateFormData: (updates: any) => void
  onNext: () => void
  onBack: () => void
}

type InputMethod = 'linkedin' | 'resume' | 'manual' | null

export default function AIPitchHelper({ formData, updateFormData, onNext, onBack }: AIPitchHelperProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLinkedInSubmit = async (linkedinUrl: string) => {
    if (!validateLinkedInUrl(linkedinUrl)) {
      setError('Please enter a valid LinkedIn URL')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await generateAIPitch({
        method: 'linkedin',
        linkedinUrl,
        context: {
          job_type: formData.job_type,
          location_current: formData.location_current,
          availability: formData.availability
        }
      })

      updateFormData({
        title: result.title,
        pitch: result.pitch,
        skills: result.skills,
        linkedin_url: linkedinUrl
      })

      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pitch')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleResumeUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB')
      return
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, or DOCX file')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await generateAIPitch({
        method: 'resume',
        resumeFile: file,
        context: {
          job_type: formData.job_type,
          location_current: formData.location_current,
          availability: formData.availability
        }
      })

      updateFormData({
        title: result.title,
        pitch: result.pitch,
        skills: result.skills,
        resume_file: file
      })

      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pitch')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleManualSubmit = async (summary: string) => {
    if (summary.length < 50) {
      setError('Please provide at least 50 characters of summary')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await generateAIPitch({
        method: 'manual',
        summary,
        context: {
          job_type: formData.job_type,
          location_current: formData.location_current,
          availability: formData.availability
        }
      })

      updateFormData({
        title: result.title,
        pitch: result.pitch,
        skills: result.skills,
        manual_summary: summary
      })

      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pitch')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderInputMethod = () => {
    switch (inputMethod) {
      case 'linkedin':
        return <LinkedInInput onSubmit={handleLinkedInSubmit} isGenerating={isGenerating} />
      case 'resume':
        return <ResumeUpload onSubmit={handleResumeUpload} isGenerating={isGenerating} fileInputRef={fileInputRef} />
      case 'manual':
        return <ManualInput onSubmit={handleManualSubmit} isGenerating={isGenerating} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!inputMethod ? (
        <div className="space-y-4">
          <p className="text-gray-600 mb-6">
            Choose how you'd like to generate your pitch. Our AI will create a compelling title, description, and skills based on your input.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setInputMethod('linkedin')}
              className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Link className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">LinkedIn Profile</h3>
              <p className="text-sm text-gray-600 text-center">
                Connect your LinkedIn profile for instant pitch generation
              </p>
            </button>

            <button
              onClick={() => setInputMethod('resume')}
              className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Upload Resume</h3>
              <p className="text-sm text-gray-600 text-center">
                Upload your resume (PDF, DOC, DOCX) for AI analysis
              </p>
            </button>

            <button
              onClick={() => setInputMethod('manual')}
              className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Edit3 className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Manual Summary</h3>
              <p className="text-sm text-gray-600 text-center">
                Write a brief summary of your experience and skills
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setInputMethod(null)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to options
          </button>
          {renderInputMethod()}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  )
}

function LinkedInInput({ onSubmit, isGenerating }: { onSubmit: (url: string) => void; isGenerating: boolean }) {
  const [linkedinUrl, setLinkedinUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(linkedinUrl)
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile URL
          </label>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/your-profile"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isGenerating || !linkedinUrl}
          className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Pitch...
            </>
          ) : (
            'Generate Pitch from LinkedIn'
          )}
        </button>
      </form>
    </div>
  )
}

function ResumeUpload({ onSubmit, isGenerating, fileInputRef }: { 
  onSubmit: (file: File) => void; 
  isGenerating: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile) {
      onSubmit(selectedFile)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resume File (PDF, DOC, DOCX - max 5MB)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isGenerating || !selectedFile}
          className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            'Generate Pitch from Resume'
          )}
        </button>
      </form>
    </div>
  )
}

function ManualInput({ onSubmit, isGenerating }: { onSubmit: (summary: string) => void; isGenerating: boolean }) {
  const [summary, setSummary] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(summary)
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Summary</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Summary (1-4 lines, at least 50 characters)
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe your military experience, key achievements, and transferable skills..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {summary.length}/500 characters
          </p>
        </div>
        <button
          type="submit"
          disabled={isGenerating || summary.length < 50}
          className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Pitch...
            </>
          ) : (
            'Generate Pitch from Summary'
          )}
        </button>
      </form>
    </div>
  )
}
