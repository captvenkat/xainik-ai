'use client'

import { useState } from 'react'

export default function Transparency() {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  const breakdown = [
    { item: 'Tech Build', amount: 500000, percentage: 50 },
    { item: 'Operations', amount: 300000, percentage: 30 },
    { item: 'Veteran Support', amount: 200000, percentage: 20 }
  ]

  const documents = [
    {
      id: 'incorporation',
      title: 'Certificate of Incorporation',
      description: 'Proof we\'re registered under the Companies Act.',
      url: '#'
    },
    {
      id: 'sec8',
      title: 'Sec-8 Nonprofit Registration',
      description: 'Non-profit; purpose over profit.',
      url: '#'
    },
    {
      id: 'tax',
      title: 'PAN & 12A/80G (when available)',
      description: 'Tax identity & donor benefits.',
      url: '#'
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transparency
          </h2>
          <p className="text-xl text-gray-600">
            Every rupee, open for all.
          </p>
        </div>

        {/* Fund Breakdown */}
        <div className="bg-white rounded-xl p-8 mb-12 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Phase 1 — ₹10,00,000 Breakdown:
          </h3>
          
          <div className="space-y-4">
            {breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-gray-900">{item.item}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatCurrency(item.amount)}</div>
                  <div className="text-sm text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Documents
          </h3>
          
          <div className="space-y-4">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {doc.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {doc.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View PDF
                  </button>
                </div>
                
                {expandedDoc === doc.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Document preview would be displayed here. For now, this is a placeholder.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            We are a registered Sec-8 Nonprofit. Every rupee is reinvested. All documents open.
          </p>
        </div>
      </div>
    </section>
  )
}
