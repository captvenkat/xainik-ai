'use client'

import { useRouter } from 'next/navigation'
import MagicPitchWizard from '@/components/veteran/MagicPitchWizard'

export default function AIFirstPitchPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Pitch</h1>
          <p className="text-gray-600">Let Xainik AI analyze your military experience and create a compelling pitch</p>
        </div>

        {/* Magic Mode Form */}
        <MagicPitchWizard onComplete={() => router.push('/dashboard/veteran?tab=analytics&created=true')} />
      </div>
    </div>
  )
}
