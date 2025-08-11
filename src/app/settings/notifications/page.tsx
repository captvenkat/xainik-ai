import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { redirect } from 'next/navigation'
import { Bell, Mail, Clock, Settings, Save } from 'lucide-react'
import NotificationPreferencesForm from '@/components/NotificationPreferencesForm'

export default async function NotificationSettingsPage() {
  const supabase = createSupabaseServerOnly()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth?redirect=/settings/notifications')
  }

  // Fetch current notification preferences
  const { data: prefs } = await supabase
    .from('notification_prefs')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          </div>
          <p className="text-gray-600">Manage how and when you receive notifications from Xainik</p>
        </div>

        {/* Notification Preferences Form */}
        <NotificationPreferencesForm initialPrefs={prefs} />
      </div>
    </div>
  )
}
