import { Users, Share2, Target, ArrowRight, CheckCircle, Heart } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support Veterans | Xainik',
  description: 'Become a supporter and help veterans connect with meaningful career opportunities. Share veteran pitches with your network and track your impact.',
  openGraph: {
    title: 'Support Veterans | Xainik',
    description: 'Become a supporter and help veterans connect with meaningful career opportunities.',
    url: '/support',
  },
  alternates: {
    canonical: '/support',
  },
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 text-gray-800 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <Share2 className="h-4 w-4" />
              Support Veterans
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Help Veterans Find Opportunities
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Become a supporter and help veterans connect with meaningful career opportunities by referring their pitches to your network.
            </p>
            
            <Link 
              href="/auth?redirectTo=/dashboard/supporter" 
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
            >
              Become a Supporter
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Supporters Help
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple process that makes a big difference in veterans' lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Browse Veterans</h3>
              <p className="text-gray-600">
                Explore veteran pitches and find those whose skills and experience match opportunities in your network.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share & Refer</h3>
              <p className="text-gray-600">
                Use our tracked referral links to share veteran pitches with potential employers and opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Impact</h3>
              <p className="text-gray-600">
                Monitor your referrals, see when they're opened, and celebrate successful connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Become a Supporter?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join our community of supporters who are making a real difference in veterans' lives while building meaningful connections.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Make a Real Impact</h3>
                    <p className="text-gray-600">Help veterans find meaningful careers that value their military experience</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Build Your Network</h3>
                    <p className="text-gray-600">Connect with employers and professionals in your industry</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Track Your Contributions</h3>
                    <p className="text-gray-600">See the impact of your referrals and celebrate successful connections</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Join a Community</h3>
                    <p className="text-gray-600">Be part of a supportive network dedicated to veteran success</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
              <Heart className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Supporter Dashboard</h3>
              <p className="text-green-100 mb-6">
                Access your personalized dashboard to track referrals, view analytics, and manage your supporter activities.
              </p>
              <ul className="space-y-2 text-green-100">
                <li>• Referral tracking and analytics</li>
                <li>• Veteran pitch browsing</li>
                <li>• Connection management</li>
                <li>• Impact reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how supporters are making a difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Sarah M.</h3>
                  <p className="text-sm text-gray-600">HR Manager</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "I referred a veteran's pitch to our hiring team and they were hired within a week. The platform made it so easy to connect great talent with opportunities."
              </p>
              <div className="text-sm text-green-600 font-medium">
                3 successful referrals
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Raj K.</h3>
                  <p className="text-sm text-gray-600">Tech Recruiter</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The referral tracking helps me see the impact of my efforts. I've helped 5 veterans find tech roles through my network."
              </p>
              <div className="text-sm text-blue-600 font-medium">
                5 successful referrals
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Lisa T.</h3>
                  <p className="text-sm text-gray-600">Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "As a business owner, I love connecting with veterans. Their leadership skills and discipline are exactly what we need."
              </p>
              <div className="text-sm text-purple-600 font-medium">
                2 successful referrals
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join our community of supporters and help veterans find meaningful career opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth?redirectTo=/dashboard/supporter" 
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Become a Supporter
            </Link>
            <Link 
              href="/browse" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Browse Veterans
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
