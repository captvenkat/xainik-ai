import React from 'react'

export default function DonationsIllustration() {
  return (
    <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Donation Fill Bar Widget */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-orange-600 mb-1">₹45,300</div>
          <div className="text-sm text-gray-600">This Week's Goal</div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-4 rounded-full" style={{ width: '75%' }}></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>₹0</span>
          <span>₹45,300</span>
        </div>
      </div>
      
      {/* Currency Symbols and Icons */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <div className="text-white font-bold text-lg">₹</div>
          </div>
          <div className="text-sm text-gray-700">₹499</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <div className="text-white font-bold text-lg">₹</div>
          </div>
          <div className="text-sm text-gray-700">₹999</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="w-8 h-8 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <div className="text-white font-bold text-lg">₹</div>
          </div>
          <div className="text-sm text-gray-700">₹1999</div>
        </div>
      </div>
    </div>
  )
}
