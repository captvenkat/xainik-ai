'use client'

interface PieChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  title?: string
  size?: number
}

export default function PieChart({ data, title, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
  
  let currentAngle = 0
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="flex items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0
              const angle = (percentage / 100) * 360
              const radius = size / 2 - 10
              const x1 = size / 2
              const y1 = size / 2
              const x2 = x1 + radius * Math.cos((currentAngle * Math.PI) / 180)
              const y2 = y1 + radius * Math.sin((currentAngle * Math.PI) / 180)
              const x3 = x1 + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180)
              const y3 = y1 + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180)
              
              const largeArcFlag = angle > 180 ? 1 : 0
              
              const path = [
                `M ${x1} ${y1}`,
                `L ${x2} ${y2}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
                'Z'
              ].join(' ')
              
              currentAngle += angle
              
              return (
                <path
                  key={index}
                  d={path}
                  fill={item.color || colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                />
              )
            })}
          </svg>
        </div>
        
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
