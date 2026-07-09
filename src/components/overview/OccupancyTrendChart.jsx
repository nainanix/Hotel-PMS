import { useState } from 'react'
import { offsetISODate } from '../../utils/dates'

const WIDTH = 700
const HEIGHT = 180
const PADDING = { top: 10, right: 4, bottom: 20, left: 4 }

function OccupancyTrendChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const todayISO = offsetISODate(0)

  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom
  const barGap = 3
  const barWidth = Math.max((chartWidth - barGap * (data.length - 1)) / data.length, 2)
  const baselineY = HEIGHT - PADDING.bottom

  const hovered = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ height: 180 }} preserveAspectRatio="none">
        <line
          x1={PADDING.left}
          y1={baselineY}
          x2={WIDTH - PADDING.right}
          y2={baselineY}
          className="stroke-navy-100 dark:stroke-navy-700"
          strokeWidth="1"
        />
        {data.map((d, i) => {
          const barHeight = Math.max((d.rate / 100) * chartHeight, 2)
          const x = PADDING.left + i * (barWidth + barGap)
          const y = baselineY - barHeight
          const isToday = d.dateISO === todayISO
          const isHovered = hoverIndex === i

          return (
            <g
              key={d.day}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-default"
            >
              <rect x={x} y={PADDING.top} width={barWidth} height={chartHeight} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={Math.min(2, barWidth / 2)}
                className={
                  isToday
                    ? 'fill-gold-500 dark:fill-gold-400'
                    : isHovered
                      ? 'fill-gold-400 dark:fill-gold-300'
                      : 'fill-gold-200 dark:fill-gold-500/30'
                }
              />
            </g>
          )
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full rounded-md border border-navy-100 bg-surface px-2.5 py-1.5 text-xs shadow-md dark:border-navy-700"
          style={{ left: `${((hoverIndex + 0.5) / data.length) * 100}%` }}
        >
          <p className="font-medium text-navy-600 dark:text-navy-50">Day {hovered.day}</p>
          <p className="text-navy-300 dark:text-navy-400">{hovered.rate}% occupied</p>
        </div>
      )}

      <div className="mt-1 flex justify-between text-[10px] text-navy-300 dark:text-navy-500">
        <span>1</span>
        <span>{data.length}</span>
      </div>
    </div>
  )
}

export default OccupancyTrendChart
