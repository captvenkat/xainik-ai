import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import PitchCard from '@/components/PitchCard'
import ShareablePitchCard from '@/components/ShareablePitchCard'
import { toPitchCardData } from '@/lib/mappers/pitches'

export const revalidate = 30

async function fetchSamplePitches() {
  const supabase = createSupabaseServerOnly()
  
  const supabaseClient = await supabase
  const { data: pitches, error } = await supabaseClient
    .from('pitches')
    .select('*')
    .eq('is_active', true)
    .limit(6)
    .order('created_at', { ascending: false })

  if (error || !pitches) {
    return []
  }

  return pitches.map(pitch => toPitchCardData(pitch))
}

export default async function ShowcasePage() {
  const pitches = await fetchSamplePitches()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            World-Class Pitch Cards
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our minimalist, shareable, and impressive pitch card designs. 
            Each variant is optimized for different use cases and platforms.
          </p>
        </div>

        {/* Standard Pitch Cards */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Standard Pitch Cards</h2>
            <p className="text-gray-600">Perfect for browsing and discovery</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pitches.slice(0, 3).map((pitch) => (
              <PitchCard key={pitch.id} data={toPitchCardData(pitch)} />
            ))}
          </div>
        </section>

        {/* Featured Pitch Cards */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Pitch Cards</h2>
            <p className="text-gray-600">Highlighted pitches with premium styling</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pitches.slice(0, 3).map((pitch) => (
              <PitchCard key={`featured-${pitch.id}`} data={toPitchCardData(pitch)} variant="featured" />
            ))}
          </div>
        </section>

        {/* Shareable Pitch Cards */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shareable Pitch Cards</h2>
            <p className="text-gray-600">Optimized for social media and sharing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pitches.slice(0, 3).map((pitch) => (
              <ShareablePitchCard 
                key={`shareable-${pitch.id}`} 
                data={toPitchCardData(pitch)} 
                variant="social"
                showStats={true}
                showActions={true}
              />
            ))}
          </div>
        </section>

        {/* Minimal Shareable Cards */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Minimal Shareable Cards</h2>
            <p className="text-gray-600">Clean design without stats for maximum focus</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pitches.slice(0, 3).map((pitch) => (
              <ShareablePitchCard 
                key={`minimal-${pitch.id}`} 
                data={toPitchCardData(pitch)} 
                variant="social"
                showStats={false}
                showActions={false}
              />
            ))}
          </div>
        </section>

        {/* Design Features */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Design Features</h2>
            <p className="text-gray-600">What makes our pitch cards world-class</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Minimalist Design</h3>
              <p className="text-gray-600">Clean, uncluttered layouts that focus on the essential information</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Shareable</h3>
              <p className="text-gray-600">Optimized for social media sharing with built-in image generation</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Impressive</h3>
              <p className="text-gray-600">Professional styling with smooth animations and modern aesthetics</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Responsive</h3>
              <p className="text-gray-600">Perfect display across all devices and screen sizes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified</h3>
              <p className="text-gray-600">Built-in verification badges and trust indicators</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive</h3>
              <p className="text-gray-600">Smooth hover effects and engaging user interactions</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Your Pitch?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of veterans who are already showcasing their skills and connecting with opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/pitch/new" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Your Pitch
              </a>
              <a 
                href="/browse" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
              >
                Browse Pitches
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
