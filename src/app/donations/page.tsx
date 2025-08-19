import { Suspense } from 'react'
import { getDonationStats, getAllDonations } from '@/lib/actions/donations-server'
import { Heart, TrendingUp, Calendar, Award, Users } from 'lucide-react'
import DonationForm from '@/components/DonationForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support Our Mission | Xainik',
  description: 'Support our mission to connect military veterans with meaningful civilian opportunities. Your donations help us provide free resources and support to veterans during their transition.',
  openGraph: {
    title: 'Support Our Mission | Xainik',
    description: 'Support our mission to connect military veterans with meaningful civilian opportunities.',
    url: '/donations',
  },
  alternates: {
    canonical: '/donations',
  },
}

export default async function DonationsPage() {
  const [stats, recentDonations] = await Promise.all([
    getDonationStats(),
    getAllDonations()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">Support Our Mission</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your donations help us connect more military veterans with meaningful civilian opportunities. 
            Every contribution makes a difference in a veteran's career transition.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-900">₹{(stats.totalAmount / 100).toLocaleString()}</div>
            <div className="text-sm text-blue-700">Total Raised</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-900">{stats.totalDonations}</div>
            <div className="text-sm text-green-700">Today</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-900">{stats.totalDonations}</div>
            <div className="text-sm text-purple-700">Last Donation</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-900">₹{(stats.totalAmount / 100).toLocaleString()}</div>
            <div className="text-sm text-orange-700">Highest</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>
            <Suspense fallback={<div>Loading donation form...</div>}>
              <DonationForm />
            </Suspense>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Donations</h2>
            {recentDonations.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Be the first to donate!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDonations.map((donation) => (
                  <div key={donation.id as string} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Supporter</div>
                      <div className="text-sm text-gray-600 mt-1">Donation received</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(donation.created_at as string).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ₹{(100).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Your Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Veteran Support</h3>
              <p className="text-gray-600">Help us provide free resources and support to veterans during their transition</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Development</h3>
              <p className="text-gray-600">Fund improvements to our platform to better serve veterans and recruiters</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Outreach Programs</h3>
              <p className="text-gray-600">Support our efforts to reach more veterans and create awareness</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
