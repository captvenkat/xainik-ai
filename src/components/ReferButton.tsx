"use client"

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import ReferModal from './ReferModal'

interface ReferButtonProps {
  pitchId: string
  pitchTitle: string
  veteranName: string
  userId?: string
  skills?: string[]
  location?: string
}

export default function ReferButton({ 
  pitchId, 
  pitchTitle, 
  veteranName, 
  userId,
  skills = [],
  location = ''
}: ReferButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    if (!userId) {
      // Redirect to auth with supporter role preselected
      window.location.href = '/auth?role=supporter&redirectTo=' + encodeURIComponent(window.location.pathname)
      return
    }
    setShowModal(true)
  }

  return (
    <>
      <button 
        onClick={handleClick}
        className="btn-success inline-flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Refer This Veteran's Pitch
      </button>

      {showModal && userId && (
        <ReferModal
          pitchId={pitchId}
          pitchTitle={pitchTitle}
          veteranName={veteranName}
          userId={userId}
          onClose={() => setShowModal(false)}
          skills={skills}
          location={location}
        />
      )}
    </>
  )
}
