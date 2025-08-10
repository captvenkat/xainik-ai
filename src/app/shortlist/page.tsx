import { getServerSupabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'
import { Star, Phone, Mail, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default async function ShortlistPage() {
  const supabase = getServerSupabase()
  
  // Check authentication and role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login?redirect=/shortlist')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'recruiter') {
    redirect('/dashboard')
  }

  // Fetch shortlisted pitches
  const { data: shortlisted } = await supabase
    .from('shortlist')
    .select(`
      id,
      created_at,
      pitches!inner(
        id,
        title,
        summary,
        skills,
        experience_years,
        location,
        profiles!inner(
          full_name,
          phone,
          email,
          avatar_url
        )
      )
    `)
    .eq('recruiter_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Shortlist</h1>
          </div>
          <p className="text-gray-600">Manage your shortlisted veterans and track interactions</p>
        </div>

        {/* Shortlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {shortlisted && shortlisted.length > 0 ? (
            shortlisted.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.pitches.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.pitches.summary?.substring(0, 120)}...
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {item.pitches.profiles.avatar_url ? (
                        <img 
                          src={item.pitches.profiles.avatar_url} 
                          alt={item.pitches.profiles.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {item.pitches.profiles.full_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.pitches.profiles.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.pitches.experience_years} years experience • {item.pitches.location}
                      </div>
                    </div>
                  </div>

                  {item.pitches.skills && item.pitches.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.pitches.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {item.pitches.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{item.pitches.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  <a
                    href={`/pitch/${item.pitches.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Pitch
                  </a>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${item.pitches.profiles.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`mailto:${item.pitches.profiles.email}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Shortlisted on {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shortlisted veterans</h3>
              <p className="text-gray-600 mb-6">
                Start browsing veterans to build your shortlist
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Veterans
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
