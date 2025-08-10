'use client'

interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  title?: string
  height?: number
  maxValue?: number
}

export default function BarChart({ data, title, height = 200, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1)
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="space-y-3" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-600 truncate">
              {item.label}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="h-6 rounded-full transition-all duration-300"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || '#3B82F6'
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
