import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ResumeRequestSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const isApproved = params.status === 'approved'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {isApproved ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Resume Request Approved
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for approving the resume request. The recruiter has been notified and will receive your resume shortly.
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Resume Request Declined
            </h1>
            <p className="text-gray-600 mb-6">
              You have declined the resume request. The recruiter has been notified of your decision.
            </p>
          </>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Return to Homepage
          </Link>
          <Link
            href="/pitches"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Browse More Pitches
          </Link>
        </div>
      </div>
    </div>
  )
}
