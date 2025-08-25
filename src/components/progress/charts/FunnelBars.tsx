'use client'

interface FunnelBarsProps {
  data: Array<{
    stage: string
    value: number
    color: string
  }>
  maxValue: number
}

export default function FunnelBars({ data, maxValue }: FunnelBarsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No funnel data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0
        const previousValue = index > 0 ? data[index - 1]?.value || 0 : item.value
        const dropoff = previousValue > 0 ? ((previousValue - item.value) / previousValue) * 100 : 0

        return (
          <div key={item.stage} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 capitalize">{item.stage}</span>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.value.toLocaleString()}</div>
                {index > 0 && (
                  <div className="text-xs text-gray-500">
                    {dropoff.toFixed(1)}% drop from {data[index - 1]?.stage || 'previous'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${item.color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(width, 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
