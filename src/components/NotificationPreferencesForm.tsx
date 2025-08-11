'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Clock, Save, Check } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'

interface NotificationPrefs {
  user_id: string
  email_enabled: boolean
  in_app_enabled: boolean
  digest_enabled: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
}

interface NotificationPreferencesFormProps {
  initialPrefs: NotificationPrefs | null
}

export default function NotificationPreferencesForm({ initialPrefs }: NotificationPreferencesFormProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    user_id: '',
    email_enabled: true,
    in_app_enabled: true,
    digest_enabled: true,
    quiet_hours_start: null,
    quiet_hours_end: null
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (initialPrefs) {
      setPrefs(initialPrefs)
    }
  }, [initialPrefs])

  async function handleSave() {
    setIsSaving(true)
    setIsSaved(false)

    try {
      const supabase = createSupabaseBrowser()
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notification_prefs')
        .upsert({
          user_id: user.id,
          email_enabled: prefs.email_enabled,
          in_app_enabled: prefs.in_app_enabled,
          digest_enabled: prefs.digest_enabled,
          quiet_hours_start: prefs.quiet_hours_start,
          quiet_hours_end: prefs.quiet_hours_end
        })

      if (error) {
        console.error('Error saving preferences:', error)
        throw error
      }

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  function updatePrefs(updates: Partial<NotificationPrefs>) {
    setPrefs(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
        
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.email_enabled}
                onChange={(e) => updatePrefs({ email_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* In-App Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <h3 className="font-medium text-gray-900">In-App Notifications</h3>
                <p className="text-sm text-gray-600">Show notifications in the app</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.in_app_enabled}
                onChange={(e) => updatePrefs({ in_app_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Digest Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <h3 className="font-medium text-gray-900">Digest Notifications</h3>
                <p className="text-sm text-gray-600">Receive daily summaries instead of individual notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.digest_enabled}
                onChange={(e) => updatePrefs({ digest_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiet Hours</h2>
        <p className="text-sm text-gray-600 mb-6">
          During quiet hours, you won't receive email notifications. In-app notifications will still be shown.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours Start
            </label>
            <input
              type="time"
              value={prefs.quiet_hours_start || ''}
              onChange={(e) => updatePrefs({ quiet_hours_start: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours End
            </label>
            <input
              type="time"
              value={prefs.quiet_hours_end || ''}
              onChange={(e) => updatePrefs({ quiet_hours_end: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Quiet Hours */}
        {(prefs.quiet_hours_start || prefs.quiet_hours_end) && (
          <button
            onClick={() => updatePrefs({ quiet_hours_start: null, quiet_hours_end: null })}
            className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear quiet hours
          </button>
        )}
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Types</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Resume Requests</h3>
              <p className="text-sm text-gray-600">When recruiters request your resume</p>
            </div>
            <span className="text-sm text-gray-500">Always enabled</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Endorsements</h3>
              <p className="text-sm text-gray-600">When someone endorses your pitch</p>
            </div>
            <span className="text-sm text-gray-500">Always enabled</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Referral Activity</h3>
              <p className="text-sm text-gray-600">When your referrals are viewed or contacted</p>
            </div>
            <span className="text-sm text-gray-500">Always enabled</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Plan Expiry</h3>
              <p className="text-sm text-gray-600">Warnings before your plan expires</p>
            </div>
            <span className="text-sm text-gray-500">Always enabled</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isSaved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : isSaved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  )
}
