import { Shield, Users, Target, Heart, Award, Globe } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us | Xainik',
  description: 'Learn about Xainik\'s mission to empower veterans by bridging the gap between military service and civilian careers. Discover how we connect veterans with meaningful opportunities.',
  openGraph: {
    title: 'About Us | Xainik',
    description: 'Learn about Xainik\'s mission to empower veterans by bridging the gap between military service and civilian careers.',
    url: '/about',
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 text-gray-800 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <Shield className="h-4 w-4" />
              Section 8 Non-Profit Organization
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Mission
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Empowering veterans to showcase their military experience and connect with meaningful career opportunities through innovative technology and community support.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Bridging the Gap Between Military Service and Civilian Careers
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Veterans bring unique skills, leadership, and discipline to the workforce, but often struggle to translate their military experience into civilian terms. Xainik bridges this gap by providing a platform where veterans can showcase their capabilities and connect directly with employers who value their service.
              </p>
              <p className="text-lg text-gray-600">
                We believe every veteran deserves the opportunity to build a fulfilling career that leverages their military training and experience. Our platform makes this connection seamless, transparent, and effective.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                <Target className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-blue-100">
                  A world where every veteran&apos;s military experience is recognized, valued, and leveraged for successful civilian careers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, effective process that connects veterans with opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Veterans Post Pitches</h3>
              <p className="text-gray-600">
                Veterans create compelling pitches highlighting their military experience, skills, and career goals using our AI-powered platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recruiters Browse & Connect</h3>
              <p className="text-gray-600">
                Employers and recruiters browse verified veteran pitches, filter by skills and requirements, and connect directly with candidates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Meaningful Careers</h3>
              <p className="text-gray-600">
                Veterans find fulfilling careers that value their military experience, while employers gain access to highly skilled, disciplined professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Service</h3>
              <p className="text-gray-600 text-sm">
                We serve veterans with the same dedication they showed in serving our country.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrity</h3>
              <p className="text-gray-600 text-sm">
                We operate with transparency, honesty, and the highest ethical standards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Impact</h3>
              <p className="text-gray-600 text-sm">
                We measure success by the meaningful careers and opportunities we help create.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600 text-sm">
                We build and nurture a supportive community of veterans, employers, and supporters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 Disclosure */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Section 8 Non-Profit Organization
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Xainik is registered as a Section 8 non-profit organization under the Companies Act, 2013. This means we operate for charitable purposes and reinvest all profits back into our mission of serving veterans.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Commitment:</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• 100% of profits are reinvested in veteran services and platform development</li>
                  <li>• Transparent financial reporting and governance</li>
                  <li>• Board oversight ensuring mission alignment</li>
                  <li>• Regular audits and compliance with non-profit regulations</li>
                </ul>
              </div>
              
              <p className="text-gray-600">
                By choosing Xainik, you&apos;re supporting a mission-driven organization dedicated to veteran success, not shareholder profits. Every transaction helps us serve more veterans and improve our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you&apos;re a veteran looking for opportunities, an employer seeking talent, or a supporter wanting to make a difference, there&apos;s a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pitch/new" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Post Your Pitch
            </Link>
            <Link href="/browse" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Browse Veterans
            </Link>
            <Link href="/donations" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Support Our Mission
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
