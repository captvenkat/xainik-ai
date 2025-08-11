"use client"

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { logActivity } from '@/lib/activity'
import { FileText, Save, AlertCircle, CheckCircle } from 'lucide-react'

interface RecruiterNotesProps {
  pitchId: string
  veteranName: string
  initialNote?: string
}

export default function RecruiterNotes({ pitchId, veteranName, initialNote = '' }: RecruiterNotesProps) {
  const [note, setNote] = useState(initialNote)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'recruiter') {
          setUserId(user.id)
          // Load existing note
          await loadExistingNote(user.id)
        }
      }
    }

    checkUser()
  }, [pitchId, supabase])

  const loadExistingNote = async (recruiterId: string) => {
    try {
      const { data, error } = await supabase
        .from('recruiter_notes')
        .select('note_text, updated_at')
        .eq('pitch_id', pitchId)
        .eq('recruiter_id', recruiterId)
        .single()

      if (!error && data) {
        setNote(data.note_text || '')
        setLastSaved(new Date(data.updated_at))
      }
    } catch (error) {
      console.error('Error loading note:', error)
    }
  }

  const saveNote = async (noteText: string) => {
    if (!userId) return

    setIsSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('recruiter_notes')
        .upsert({
          pitch_id: pitchId,
          recruiter_id: userId,
          note_text: noteText,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'pitch_id,recruiter_id'
        })

      if (error) throw error

      // Log activity
      await logActivity('pitch_updated', {
        pitch_id: pitchId,
        recruiter_id: userId,
        note_length: noteText.length
      })

      setLastSaved(new Date())
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)

    } catch (err: any) {
      setError(err.message || 'Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value
    setNote(newNote)
    setError('')

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    saveTimeoutRef.current = setTimeout(() => {
      if (newNote.trim()) {
        saveNote(newNote)
      }
    }, 2000)
  }

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await saveNote(note)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (!userId) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Sign in as a recruiter to add notes about this veteran.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
              Saving...
            </div>
          )}
          {success && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Saved
            </div>
          )}
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="ml-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder={`Add your notes about ${veteranName}...`}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Notes are automatically saved as you type
          </p>
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Now
          </button>
        </div>
      </div>
    </div>
  )
}
