import { Heart, Shield, Users, Target, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SupportTheMissionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 text-gray-800 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <Heart className="h-4 w-4 text-red-500" />
              Support Veteran Success
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Support the Mission
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Help us empower veterans to build meaningful careers by supporting our platform and mission.
            </p>
            
            <Link 
              href="/donations" 
              className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
            >
              Make a Donation
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Support Makes a Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every contribution helps us serve more veterans and improve our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Development</h3>
              <p className="text-gray-600">
                Your donations help us build and maintain the technology that connects veterans with opportunities.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Veteran Services</h3>
              <p className="text-gray-600">
                Support programs that help veterans create compelling pitches and navigate career transitions.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Building</h3>
              <p className="text-gray-600">
                Foster connections between veterans, employers, and supporters in our growing community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Support Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Support Xainik?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                As a Section 8 non-profit organization, we reinvest 100% of our resources back into serving veterans. Your support directly impacts the lives of veterans seeking meaningful careers.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Transparent Impact</h3>
                    <p className="text-gray-600">See exactly how your contributions help veterans succeed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Sustainable Model</h3>
                    <p className="text-gray-600">Your support helps us maintain and improve our platform</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Community Driven</h3>
                    <p className="text-gray-600">Join a community dedicated to veteran success</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white">
              <Heart className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Section 8 Non-Profit</h3>
              <p className="text-red-100 mb-6">
                We operate for charitable purposes and reinvest all profits back into our mission of serving veterans.
              </p>
              <ul className="space-y-2 text-red-100">
                <li>• 100% of donations go to veteran services</li>
                <li>• Transparent financial reporting</li>
                <li>• Board oversight and governance</li>
                <li>• Regular impact assessments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Support */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ways to Support
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              There are many ways you can contribute to our mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">One-Time Donation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Make a one-time contribution to support our mission
              </p>
              <Link 
                href="/donations" 
                className="text-red-600 font-medium hover:text-red-700 transition-colors"
              >
                Donate Now →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Become a Supporter</h3>
              <p className="text-gray-600 text-sm mb-4">
                Join our community and help refer veteran pitches
              </p>
              <Link 
                href="/support" 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Join Now →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hire Veterans</h3>
              <p className="text-gray-600 text-sm mb-4">
                Browse and hire veterans through our platform
              </p>
              <Link 
                href="/browse" 
                className="text-green-600 font-medium hover:text-green-700 transition-colors"
              >
                Browse Veterans →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Spread the Word</h3>
              <p className="text-gray-600 text-sm mb-4">
                Share our mission with your network
              </p>
              <Link 
                href="/about" 
                className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-pink-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-red-100">
              Together, we're making a difference in veterans' lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-red-100">Veterans Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">200+</div>
              <div className="text-red-100">Employers Connected</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-red-100">Successful Placements</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">₹50L+</div>
              <div className="text-red-100">Total Donations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Your support helps us continue our mission of empowering veterans. Every contribution matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/donations" 
              className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Make a Donation
            </Link>
            <Link 
              href="/support" 
              className="border-2 border-red-600 text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors"
            >
              Become a Supporter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
