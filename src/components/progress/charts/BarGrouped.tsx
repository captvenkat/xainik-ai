'use client'

interface BarGroupedProps {
  data: Array<{
    label: string
    views: number
    contacts: number
    color: string
  }>
  height?: number
}

export default function BarGrouped({ data, height = 200 }: BarGroupedProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No channel data available</p>
      </div>
    )
  }

  const maxViews = Math.max(...data.map(d => d.views))
  const maxContacts = Math.max(...data.map(d => d.contacts))
  const maxValue = Math.max(maxViews, maxContacts)

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const viewsHeight = maxValue > 0 ? (item.views / maxValue) * 100 : 0
          const contactsHeight = maxValue > 0 ? (item.contacts / maxValue) * 100 : 0

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              {/* Bars */}
              <div className="w-full flex gap-1 mb-2" style={{ height: '80%' }}>
                <div
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{ height: `${viewsHeight}%` }}
                  title={`${item.views} views`}
                />
                <div
                  className="flex-1 bg-purple-500 rounded-t"
                  style={{ height: `${contactsHeight}%` }}
                  title={`${item.contacts} contacts`}
                />
              </div>
              
              {/* Label */}
              <div className="text-xs text-gray-600 text-center">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Views</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Contacts</span>
        </div>
      </div>
    </div>
  )
}
