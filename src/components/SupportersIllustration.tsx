import React from 'react'

export default function SupportersIllustration() {
  return (
    <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* One-click Endorse Button */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-center">
          <div className="w-8 h-8 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
          </div>
          <div className="text-white font-semibold text-sm">One-click Endorse</div>
        </div>
      </div>
      
      {/* Auto-sent Referral Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 bg-teal-500 rounded-full"></div>
          <div className="flex-1">
            <div className="w-24 h-3 bg-gray-600 rounded mb-1"></div>
            <div className="w-32 h-2 bg-gray-400 rounded"></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="w-full h-2 bg-gray-300 rounded mb-1"></div>
          <div className="w-3/4 h-2 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      {/* Progress Tracker */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="text-sm text-gray-600">Shared</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="text-sm text-gray-600">Opened</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
          <div className="text-sm text-gray-600">Feedback</div>
        </div>
      </div>
    </div>
  )
}
