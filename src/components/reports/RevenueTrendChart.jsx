import { useState } from 'react'
import { formatCurrency } from '../../utils/format'

const WIDTH = 700
const HEIGHT = 200
const PADDING = { top: 10, right: 4, bottom: 24, left: 4 }

function monthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function RevenueTrendChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-navy-300 dark:text-navy-500">No revenue history yet</p>
  }

  const max = Math.max(...data.map((d) => d.revenue), 1)
  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom
  const barGap = 8
  const barWidth = Math.max((chartWidth - barGap * (data.length - 1)) / data.length, 4)
  const baselineY = HEIGHT - PADDING.bottom

  const hovered = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none">
        <line
          x1={PADDING.left}
          y1={baselineY}
          x2={WIDTH - PADDING.right}
          y2={baselineY}
          className="stroke-navy-100 dark:stroke-navy-700"
          strokeWidth="1"
        />
        {data.map((d, i) => {
          const barHeight = Math.max((d.revenue / max) * chartHeight, 2)
          const x = PADDING.left + i * (barWidth + barGap)
          const y = baselineY - barHeight
          const isHovered = hoverIndex === i

          return (
            <g key={d.month} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
              <rect x={x} y={PADDING.top} width={barWidth} height={chartHeight} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={Math.min(3, barWidth / 2)}
                className={isHovered ? 'fill-gold-500 dark:fill-gold-400' : 'fill-gold-300 dark:fill-gold-500/50'}
              />
              <text
                x={x + barWidth / 2}
                y={HEIGHT - 6}
                textAnchor="middle"
                className="fill-navy-300 dark:fill-navy-500"
                style={{ fontSize: 9 }}
              >
                {monthLabel(d.month)}
              </text>
            </g>
          )
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full rounded-md border border-navy-100 bg-surface px-2.5 py-1.5 text-xs shadow-md dark:border-navy-700"
          style={{ left: `${((hoverIndex + 0.5) / data.length) * 100}%` }}
        >
          <p className="font-medium text-navy-600 dark:text-navy-50">{monthLabel(hovered.month)}</p>
          <p className="text-navy-300 dark:text-navy-400">{formatCurrency(hovered.revenue)}</p>
        </div>
      )}
    </div>
  )
}

export default RevenueTrendChart
