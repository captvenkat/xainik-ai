import { CheckCircle, Share2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ReferralSentPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Referral Sent Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Your referral has been sent. We'll track when it's opened and notify you of any activity.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/dashboard/supporter"
              className="block w-full btn-primary"
            >
              View My Referrals
            </Link>
            <Link 
              href="/browse"
              className="block w-full btn-secondary"
            >
              Browse More Veterans
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Share2 className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm font-medium text-blue-900">Track Your Impact</p>
            </div>
            <p className="text-sm text-blue-700">
              Check your supporter dashboard to see referral analytics and successful connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
