'use client'

import { useState } from 'react'
import { createResumeRequest } from '@/lib/actions/resumeRequests'
import { logActivity } from '@/lib/activity'

interface RequestResumeButtonProps {
  pitchId: string
  veteranId: string
  recruiterId: string
  veteranName: string
  pitchTitle: string
}

export default function RequestResumeButton({
  pitchId,
  veteranId,
  recruiterId,
  veteranName,
  pitchTitle
}: RequestResumeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [jobRole, setJobRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const requestData = {
        pitch_id: pitchId,
        user_id: veteranId, // Changed from veteran_id
        recruiter_user_id: recruiterId, // Changed from recruiter_id
        job_role: jobRole
      }
      await createResumeRequest(requestData)
      
      // Log activity
      await logActivity('resume_request_sent', {
        recruiter_id: recruiterId,
        veteran_id: veteranId,
        pitch_id: pitchId,
        job_role: jobRole
      })

      setMessage('Resume request sent successfully! The veteran will be notified.')
      setIsOpen(false)
      setJobRole('')
    } catch (error) {
      setMessage('Failed to send resume request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full btn-primary"
      >
        📄 Request Resume
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Resume</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role (Optional)
                </label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g., Project Manager, Operations Lead"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>You're requesting a resume from <strong>{veteranName}</strong></p>
                <p>for their pitch: <strong>"{pitchTitle}"</strong></p>
              </div>

              {message && (
                <div className={`text-sm p-3 rounded ${
                  message.includes('successfully') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
