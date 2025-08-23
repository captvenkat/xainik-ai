import React from 'react'

export default function HeroDashboardIllustration() {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Main Dashboard Screen */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
        
        {/* Referral Cards */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="w-20 h-3 bg-blue-600 rounded"></div>
                  <div className="w-16 h-2 bg-blue-400 rounded mt-1"></div>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded"></div>
                </div>
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <div>
                  <div className="w-24 h-3 bg-green-600 rounded"></div>
                  <div className="w-18 h-2 bg-green-400 rounded mt-1"></div>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Action Icons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="w-10 h-10 bg-teal-500 rounded-lg shadow-sm flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded"></div>
        </div>
        <div className="w-10 h-10 bg-green-500 rounded-lg shadow-sm flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded"></div>
        </div>
      </div>
      
      {/* Movement Arrows */}
      <div className="absolute bottom-6 left-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded"></div>
          </div>
          <div className="w-12 h-1 bg-navy-300 rounded"></div>
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
