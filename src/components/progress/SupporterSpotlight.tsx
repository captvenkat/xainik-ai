'use client'

import { useState } from 'react'
import { Users, Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { micro } from '@/lib/microcopy/progress'
import type { SupporterRow } from '@/lib/actions/progress'

interface SupporterSpotlightProps {
  data: SupporterRow[] | null
}

export default function SupporterSpotlight({ data }: SupporterSpotlightProps) {
  const [showAll, setShowAll] = useState(false)
  const [showThankModal, setShowThankModal] = useState(false)
  const [showAskAgainModal, setShowAskAgainModal] = useState(false)
  const [selectedSupporter, setSelectedSupporter] = useState<SupporterRow | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporter Spotlight</h3>
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No supporters yet</p>
          <p className="text-sm">{micro.supporters.empty}</p>
        </div>
      </div>
    )
  }

  const displayedSupporters = showAll ? data : data.slice(0, 3)

  const handleThankSupporter = (supporter: SupporterRow) => {
    setSelectedSupporter(supporter)
    setShowThankModal(true)
  }

  const handleAskAgain = (supporter: SupporterRow) => {
    setSelectedSupporter(supporter)
    setShowAskAgainModal(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporter Spotlight</h3>
      <p className="text-sm text-gray-600 mb-6">People helping you get discovered by recruiters.</p>

      <div className="space-y-4">
        {displayedSupporters.map((supporter) => (
          <div key={supporter.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {supporter.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{supporter.name}</h4>
                <p className="text-sm text-gray-500">
                  {micro.supporters.rowSuffix(supporter.shares, supporter.views, supporter.contacts)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleThankSupporter(supporter)}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                title={micro.supporters.thank}
              >
                <Heart className="w-4 h-4" />
                Thank
              </button>
              <button
                onClick={() => handleAskAgain(supporter)}
                className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors"
                title={micro.supporters.askAgain}
              >
                <MessageCircle className="w-4 h-4" />
                Ask Again
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {data.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                See All ({data.length})
              </>
            )}
          </button>
        </div>
      )}

      {/* Open Network Supporters Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Open Network Supporters</h4>
        <p className="text-sm text-gray-500 mb-3">{micro.supporters.openNetworkNote}</p>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Impact only:</strong> People outside your circle who still shared your pitch.
          </p>
        </div>
      </div>

      {/* Thank Supporter Modal */}
      {showThankModal && selectedSupporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Thank {selectedSupporter.name}</h3>
            <p className="text-gray-600 mb-4">
              Send a thank you message to {selectedSupporter.name} for their support.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowThankModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowThankModal(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Thank You
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask Again Modal */}
      {showAskAgainModal && selectedSupporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ask {selectedSupporter.name} Again</h3>
            <p className="text-gray-600 mb-4">
              Politely ask {selectedSupporter.name} to share your pitch again.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAskAgainModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAskAgainModal(false)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
