import React from 'react'

export default function RecruitersIllustration() {
  return (
    <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Stacked Candidate Cards */}
      <div className="space-y-3">
        {/* Card 1 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
              <div>
                <div className="w-20 h-3 bg-gray-700 rounded mb-1"></div>
                <div className="w-16 h-2 bg-gray-500 rounded"></div>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              Active &lt;90 days
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 relative ml-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full"></div>
              <div>
                <div className="w-24 h-3 bg-gray-700 rounded mb-1"></div>
                <div className="w-18 h-2 bg-gray-500 rounded"></div>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              Active &lt;90 days
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 relative ml-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full"></div>
              <div>
                <div className="w-22 h-3 bg-gray-700 rounded mb-1"></div>
                <div className="w-20 h-2 bg-gray-500 rounded"></div>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              Active &lt;90 days
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
