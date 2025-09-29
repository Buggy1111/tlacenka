'use client'

import React, { memo } from 'react'
import { PieChart, BarChart3, Activity } from 'lucide-react'

export const CHART_TYPES = {
  PIE: 'pie',
  BAR: 'bar',
  RADAR: 'radar'
} as const

export type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES]

export interface ChartDataItem {
  name: string
  value: number
  color: string
  icon: string
  percentage?: number
}

export interface SimpleChartsProps {
  data?: ChartDataItem[]
  chartType?: ChartType
  onChartTypeChange?: (type: ChartType) => void
  showSelector?: boolean
  formatter?: (value: number) => string
  title?: string
  subtitle?: string
  className?: string
  selectorLabels?: Record<string, string>
  height?: number
}

// Default formatter
const defaultFormatter = (value: number) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Chart Type Selector
const ChartTypeSelector = memo<{
  activeType: ChartType
  onChange: (type: ChartType) => void
  labels?: Record<string, string>
}>(({ activeType, onChange, labels = {} }) => {
  const defaultLabels = {
    pie: 'Pie',
    bar: 'Bar',
    radar: 'Radar'
  }

  const chartLabels = { ...defaultLabels, ...labels }

  const types: Array<{ id: ChartType; icon: typeof PieChart; label: string }> = [
    { id: CHART_TYPES.PIE, icon: PieChart, label: chartLabels.pie },
    { id: CHART_TYPES.BAR, icon: BarChart3, label: chartLabels.bar },
    { id: CHART_TYPES.RADAR, icon: Activity, label: chartLabels.radar }
  ]

  return (
    <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
      {types.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-300 transform
            ${activeType === id
              ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30 shadow-md scale-105'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
})

ChartTypeSelector.displayName = 'ChartTypeSelector'

// Simple Pie Chart
const SimplePieChart = memo<{
  data: ChartDataItem[]
  dimensions: { width: number; height: number }
  formatter: (value: number) => string
}>(({ data, dimensions, formatter }) => {
  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2
  const radius = Math.min(centerX, centerY) - 40

  // Calculate angles
  let currentAngle = -Math.PI / 2
  const slices = data.map(item => {
    const startAngle = currentAngle
    const sweepAngle = (item.percentage || 0) / 100 * Math.PI * 2
    currentAngle += sweepAngle
    const endAngle = currentAngle
    const midAngle = startAngle + sweepAngle / 2

    return {
      ...item,
      startAngle,
      endAngle,
      midAngle
    }
  })

  const createPath = (startAngle: number, endAngle: number) => {
    const innerRadius = radius * 0.6
    const outerRadius = radius

    const x1 = centerX + Math.cos(startAngle) * innerRadius
    const y1 = centerY + Math.sin(startAngle) * innerRadius
    const x2 = centerX + Math.cos(startAngle) * outerRadius
    const y2 = centerY + Math.sin(startAngle) * outerRadius
    const x3 = centerX + Math.cos(endAngle) * outerRadius
    const y3 = centerY + Math.sin(endAngle) * outerRadius
    const x4 = centerX + Math.cos(endAngle) * innerRadius
    const y4 = centerY + Math.sin(endAngle) * innerRadius

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}
    `
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
      <defs>
        {data.map((item, index) => (
          <radialGradient key={`gradient-${index}`} id={`gradient-${index}`}>
            <stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={item.color} stopOpacity="1" />
          </radialGradient>
        ))}
      </defs>

      {slices.map((slice, index) => (
        <g key={slice.name}>
          <path
            d={createPath(slice.startAngle, slice.endAngle)}
            fill={`url(#gradient-${index})`}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
            className="transition-all duration-300 hover:opacity-80"
          />

          {(slice.percentage || 0) > 5 && (
            <text
              x={centerX + Math.cos(slice.midAngle) * radius * 0.8}
              y={centerY + Math.sin(slice.midAngle) * radius * 0.8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white font-bold text-sm pointer-events-none"
            >
              {Math.round(slice.percentage || 0)}%
            </text>
          )}
        </g>
      ))}

      {/* Center info */}
      <g className="pointer-events-none">
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          className="fill-white/60 text-sm"
        >
          Celkem
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="fill-white text-xl font-bold"
        >
          {total}
        </text>
      </g>
    </svg>
  )
})

SimplePieChart.displayName = 'SimplePieChart'

// Simple Bar Chart
const SimpleBarChart = memo<{
  data: ChartDataItem[]
  dimensions: { width: number; height: number }
  formatter: (value: number) => string
}>(({ data, dimensions, formatter }) => {
  const margin = { top: 20, right: 20, bottom: 60, left: 80 }
  const chartWidth = dimensions.width - margin.left - margin.right
  const chartHeight = dimensions.height - margin.top - margin.bottom

  const maxValue = Math.max(...data.map(item => item.value))
  const yScale = chartHeight / maxValue
  const barWidth = chartWidth / data.length * 0.8
  const barSpacing = chartWidth / data.length * 0.2

  return (
    <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
      <defs>
        {data.map((item, index) => (
          <linearGradient key={`bar-gradient-${index}`} id={`bar-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={item.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={item.color} stopOpacity="0.7" />
          </linearGradient>
        ))}
      </defs>

      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Y-axis */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={chartHeight}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1="0"
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const value = maxValue * ratio
          const y = chartHeight - (chartHeight * ratio)
          return (
            <g key={ratio}>
              <line
                x1="-5"
                y1={y}
                x2="0"
                y2={y}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <text
                x="-10"
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-white/60 text-xs"
              >
                {Math.round(value)}
              </text>
              {ratio > 0 && (
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}
            </g>
          )
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const x = index * (barWidth + barSpacing) + barSpacing / 2
          const barHeight = (item.value / maxValue) * chartHeight
          const y = chartHeight - barHeight

          return (
            <g key={item.name}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#bar-gradient-${index})`}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                className="transition-all duration-300 hover:opacity-80"
                rx="4"
                ry="4"
              />

              {/* Value label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="fill-white text-xs font-bold"
              >
                {item.value}
              </text>

              {/* Category label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 15}
                textAnchor="middle"
                className="fill-white/70 text-sm font-medium"
                style={{ fontSize: '12px' }}
              >
                {item.name}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
})

SimpleBarChart.displayName = 'SimpleBarChart'

// Simple Radar Chart
const SimpleRadarChart = memo<{
  data: ChartDataItem[]
  dimensions: { width: number; height: number }
  formatter: (value: number) => string
}>(({ data, dimensions, formatter }) => {
  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2
  const radius = Math.min(centerX, centerY) - 60

  const maxValue = Math.max(...data.map(item => item.value))
  const numLevels = 5
  const angleStep = (2 * Math.PI) / data.length

  // Generate radar grid levels
  const levels = Array.from({ length: numLevels }, (_, i) => {
    const levelRadius = radius * (i + 1) / numLevels
    const levelValue = maxValue * (i + 1) / numLevels
    return { radius: levelRadius, value: levelValue }
  })

  // Generate data points for radar polygon
  const dataPoints = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2 // Start from top
    const pointRadius = (item.value / maxValue) * radius
    return {
      x: centerX + Math.cos(angle) * pointRadius,
      y: centerY + Math.sin(angle) * pointRadius,
      labelX: centerX + Math.cos(angle) * (radius + 30),
      labelY: centerY + Math.sin(angle) * (radius + 30),
      angle,
      ...item
    }
  })

  // Create polygon path
  const polygonPath = dataPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ') + ' Z'

  return (
    <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
      <defs>
        <radialGradient id="radar-fill">
          <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(251, 191, 36)" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* Grid circles and axis lines */}
      <g>
        {/* Grid circles */}
        {levels.map((level, index) => (
          <circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={level.radius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeDasharray={index === levels.length - 1 ? "none" : "2,2"}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2
          const endX = centerX + Math.cos(angle) * radius
          const endY = centerY + Math.sin(angle) * radius
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          )
        })}

        {/* Level value labels */}
        {levels.map((level, index) => (
          <text
            key={index}
            x={centerX + 5}
            y={centerY - level.radius}
            className="fill-white/50 text-xs"
            textAnchor="start"
          >
            {Math.round(level.value)}
          </text>
        ))}
      </g>

      {/* Data polygon */}
      <path
        d={polygonPath}
        fill="url(#radar-fill)"
        stroke="rgb(251, 191, 36)"
        strokeWidth="2"
        className="transition-all duration-300 hover:opacity-80"
      />

      {/* Data points */}
      {dataPoints.map((point, index) => (
        <g key={point.name}>
          <circle
            cx={point.x}
            cy={point.y}
            r="4"
            fill={point.color}
            stroke="white"
            strokeWidth="2"
            className="transition-all duration-300 hover:r-6"
          />

          {/* Labels */}
          <text
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white/80 text-sm font-medium"
            style={{
              textAnchor: point.labelX > centerX ? 'start' :
                         point.labelX < centerX ? 'end' : 'middle'
            }}
          >
            {point.name}
          </text>

          {/* Value labels */}
          <text
            x={point.labelX}
            y={point.labelY + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white/60 text-xs"
            style={{
              textAnchor: point.labelX > centerX ? 'start' :
                         point.labelX < centerX ? 'end' : 'middle'
            }}
          >
            {point.value}
          </text>
        </g>
      ))}

      {/* Center point */}
      <circle
        cx={centerX}
        cy={centerY}
        r="2"
        fill="rgba(255,255,255,0.5)"
      />
    </svg>
  )
})

SimpleRadarChart.displayName = 'SimpleRadarChart'

// Main component
const SimpleCharts = memo<SimpleChartsProps>(({
  data = [],
  chartType = CHART_TYPES.PIE,
  onChartTypeChange = () => {},
  showSelector = true,
  formatter = defaultFormatter,
  title = "Chart",
  subtitle = "",
  className = "",
  selectorLabels = {},
  height = 400
}) => {
  // Process data with percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const chartData = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }))

  // Responsive dimensions
  const dimensions = {
    width: Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 100 : 600),
    height: Math.max(300, height - 120)
  }

  if (chartData.length === 0) {
    return (
      <div className={`glass-card ${className}`}>
        <div className="text-center py-12">
          <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
            <PieChart className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-white/60 font-medium">
            Žádná data k zobrazení
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {/* Header */}
      {(title || showSelector) && (
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {title && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-white">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-white/60 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {showSelector && (
              <ChartTypeSelector
                activeType={chartType}
                onChange={onChartTypeChange as (type: ChartType) => void}
                labels={selectorLabels}
              />
            )}
          </div>
        </div>
      )}

      {/* Chart container */}
      <div className="relative p-4 md:p-6 flex justify-center items-center overflow-hidden" style={{ minHeight: `${Math.max(320, height - 100)}px` }}>
        {chartType === CHART_TYPES.PIE && (
          <SimplePieChart
            data={chartData}
            dimensions={dimensions}
            formatter={formatter}
          />
        )}
        {chartType === CHART_TYPES.BAR && (
          <SimpleBarChart
            data={chartData}
            dimensions={dimensions}
            formatter={formatter}
          />
        )}
        {chartType === CHART_TYPES.RADAR && (
          <SimpleRadarChart
            data={chartData}
            dimensions={dimensions}
            formatter={formatter}
          />
        )}
      </div>
    </div>
  )
})

SimpleCharts.displayName = 'SimpleCharts'

export default SimpleCharts
export { ChartTypeSelector }