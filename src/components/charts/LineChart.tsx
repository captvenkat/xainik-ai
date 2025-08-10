'use client'

interface LineChartProps {
  data: Array<{
    label: string
    value: number
  }>
  title?: string
  height?: number
  color?: string
}

export default function LineChart({ data, title, height = 200, color = '#3B82F6' }: LineChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  const min = Math.min(...data.map(d => d.value), 0)
  const range = max - min
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = range > 0 ? 100 - ((item.value - min) / range) * 100 : 50
    return `${x}% ${y}%`
  }).join(', ')
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ height }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Line chart */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={points}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = range > 0 ? ((item.value - min) / range) * 100 : 50
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${100 - y}%`}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            )
          })}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index} className="text-center">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
