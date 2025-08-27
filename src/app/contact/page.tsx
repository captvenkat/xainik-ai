import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { submitContact } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ContactPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (k) => cookieStore.get(k)?.value,
        set: (k, v, o) => cookieStore.set(k, v, o),
        remove: (k, o) => cookieStore.set(k, '', { ...o, maxAge: 0 })
      }
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-3">Contact us</h1>
      <p className="text-sm text-gray-600 mb-6">
        Veteran registrations are closed after the first 50. If you have a message for us, please share it here.
      </p>
      <form action={async (formData) => {
        'use server'
        await submitContact(formData)
      }} className="grid gap-3">
        <input name="name" defaultValue={user?.user_metadata?.full_name || ''} placeholder="Your name" className="border rounded-md p-2" />
        <input name="email" type="email" defaultValue={user?.email || ''} placeholder="Your email (optional)" className="border rounded-md p-2" />
        <textarea name="message" placeholder="Write your message…" required className="border rounded-md p-2 min-h-[140px]" />
        <button type="submit" className="btn">Send</button>
      </form>
    </div>
  )
}
