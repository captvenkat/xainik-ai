'use client'

import { useState, useRef } from 'react'
import { validateLinkedInUrl } from '@/lib/validators'
import { Upload, FileText, Link, Edit3, Loader2, RefreshCw, CheckCircle } from 'lucide-react'

interface AIPitchHelperProps {
  formData: any
  updateFormData: (updates: any) => void
  onNext: () => void
  onBack: () => void
}

type InputMethod = 'linkedin' | 'resume' | 'manual' | null

interface GeneratedPitch {
  title: string
  pitch: string
  skills: string[]
}

export default function AIPitchHelper({ formData, updateFormData, onNext, onBack }: AIPitchHelperProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [generatedPitch, setGeneratedPitch] = useState<GeneratedPitch | null>(null)
  const [currentInput, setCurrentInput] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const callAIApi = async (input: any) => {
    const response = await fetch('/api/ai/generate-pitch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to generate pitch')
    }

    const data = await response.json()
    return data.pitch
  }

  const handleLinkedInSubmit = async (linkedinUrl: string) => {
    if (!validateLinkedInUrl(linkedinUrl)) {
      setError('Please enter a valid LinkedIn URL')
      return
    }

    setIsGenerating(true)
    setError('')
    setCurrentInput({ inputType: 'linkedin', linkedinUrl })

    try {
      const result = await callAIApi({
        inputType: 'linkedin',
        linkedinUrl
      })

      setGeneratedPitch(result)
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
      // First upload the resume
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadResponse = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload resume')
      }

      const uploadData = await uploadResponse.json()
      setCurrentInput({ inputType: 'resume', resumeKey: uploadData.storagePath })

      // Then generate pitch
      const result = await callAIApi({
        inputType: 'resume',
        resumeKey: uploadData.storagePath
      })

      setGeneratedPitch(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume')
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
    setCurrentInput({ inputType: 'manual', text: summary })

    try {
      const result = await callAIApi({
        inputType: 'manual',
        text: summary
      })

      setGeneratedPitch(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pitch')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    if (!currentInput) return
    
    setIsGenerating(true)
    setError('')

    try {
      const result = await callAIApi(currentInput)
      setGeneratedPitch(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate pitch')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUsePitch = () => {
    if (!generatedPitch) return
    
    updateFormData({
      title: generatedPitch.title,
      pitch: generatedPitch.pitch,
      skills: generatedPitch.skills,
      ...(currentInput?.inputType === 'linkedin' && { linkedin_url: currentInput.linkedinUrl }),
      ...(currentInput?.inputType === 'manual' && { manual_summary: currentInput.text })
    })

    onNext()
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

  const renderGeneratedPitch = () => {
    if (!generatedPitch) return null

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Generated Pitch</h3>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 text-green-700 hover:text-green-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={generatedPitch.title}
                onChange={(e) => setGeneratedPitch({ ...generatedPitch, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={80}
              />
              <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                {generatedPitch.title.length}/80
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pitch</label>
            <div className="flex items-start justify-between">
              <textarea
                value={generatedPitch.pitch}
                onChange={(e) => setGeneratedPitch({ ...generatedPitch, pitch: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={300}
              />
              <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                {generatedPitch.pitch.length}/300
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (exactly 3)</label>
            <div className="flex gap-2">
              {generatedPitch.skills.map((skill, index) => (
                <input
                  key={index}
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...generatedPitch.skills]
                    newSkills[index] = e.target.value
                    setGeneratedPitch({ ...generatedPitch, skills: newSkills })
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={20}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleUsePitch}
            className="flex-1 bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Use This Pitch
          </button>
          <button
            onClick={() => {
              setGeneratedPitch(null)
              setCurrentInput(null)
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    )
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
            onClick={() => {
              setInputMethod(null)
              setGeneratedPitch(null)
              setCurrentInput(null)
            }}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to options
          </button>
          {renderInputMethod()}
        </div>
      )}

      {renderGeneratedPitch()}

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
  fileInputRef: React.RefObject<HTMLInputElement | null>;
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
            maxLength={500}
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
