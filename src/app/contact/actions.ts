'use server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function submitContact(formData: FormData) {
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
      }
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const email = String(formData.get('email') ?? '').trim() || undefined
  const name = String(formData.get('name') ?? '').trim() || undefined
  const message = String(formData.get('message') ?? '').trim()
  if (!message) return { ok: false, error: 'Please write a message.' }

  const { error } = await supabase.from('contact_messages').insert({
    owner_id: user?.id ?? null, email, name, message
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
