import React from 'react'

export default function ClosingCTAIllustration() {
  return (
    <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Connection Flow Panel */}
      <div className="flex items-center justify-center gap-6 h-full">
        {/* Veteran Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded"></div>
          </div>
          <div className="w-20 h-3 bg-gray-700 rounded mb-2"></div>
          <div className="w-16 h-2 bg-gray-500 rounded mb-2"></div>
          <div className="w-12 h-2 bg-gray-400 rounded"></div>
        </div>
        
        {/* Connection Arrow */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mb-2">
            <div className="w-4 h-4 bg-white rounded"></div>
          </div>
          <div className="w-16 h-1 bg-teal-300 rounded"></div>
        </div>
        
        {/* Recruiter Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded"></div>
          </div>
          <div className="w-24 h-3 bg-gray-700 rounded mb-2"></div>
          <div className="w-20 h-2 bg-gray-500 rounded mb-2"></div>
          <div className="w-14 h-2 bg-gray-400 rounded"></div>
        </div>
      </div>
      
      {/* Success Indicators */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded"></div>
        </div>
        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded"></div>
        </div>
      </div>
    </div>
  )
}
