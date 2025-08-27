import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import MagicPitchWizard from '@/components/veteran/MagicPitchWizard'

export default async function NewPitchPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?redirect=/pitch/new')

  const { data: existing } = await supabase
    .from('pitches')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase
      .from('pitches')
      .insert({ owner_id: user.id, title: null, status: 'draft' })
    if (error) throw error
  }

  // Render your existing Magic Mode UI (unchanged)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Pitch</h1>
          <p className="text-gray-600">Let Xainik AI analyze your military experience and create a compelling pitch</p>
        </div>

        {/* Magic Mode Form */}
        <MagicPitchWizard 
          userFromServer={{ id: user.id, email: user.email }}
          onComplete={async () => {
            // Mark onboarding as complete and redirect
            try {
              const { completeOnboarding } = await import('./actions')
              const result = await completeOnboarding()
              if (result.ok) {
                window.location.href = '/dashboard/veteran?tab=analytics&created=true'
              } else {
                // Fallback redirect even if onboarding completion fails
                window.location.href = '/dashboard/veteran?tab=analytics&created=true'
              }
            } catch (error) {
              // Fallback redirect on error
              window.location.href = '/dashboard/veteran?tab=analytics&created=true'
            }
          }} 
        />
      </div>
    </div>
  )
}
