import { Wrench } from 'lucide-react'
import { parseISODate } from '../../utils/dates'

const MS_PER_DAY = 1000 * 60 * 60 * 24

function MaintenanceBlock({ period, rowIndex, year, month, daysInMonth, onClick }) {
  const monthStart = new Date(year, month, 1)
  const monthEndExclusive = new Date(year, month + 1, 1)
  const start = parseISODate(period.startDate)
  const end = parseISODate(period.endDate)

  const clampedStart = start < monthStart ? monthStart : start
  const clampedEnd = end > monthEndExclusive ? monthEndExclusive : end

  const startOffset = Math.round((clampedStart - monthStart) / MS_PER_DAY)
  const endOffset = Math.round((clampedEnd - monthStart) / MS_PER_DAY)
  if (endOffset <= startOffset) return null

  const gridColumnStart = startOffset + 2
  const gridColumnEnd = Math.min(endOffset, daysInMonth) + 2

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(period)
      }}
      className="m-1.5 flex cursor-pointer items-center gap-1.5 rounded-md border border-navy-200 bg-navy-50 px-2 text-xs font-medium text-navy-400 transition-colors hover:border-navy-300 dark:border-navy-600 dark:bg-navy-800/50 dark:text-navy-400 dark:hover:border-navy-400"
      style={{
        gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
        gridRow: rowIndex,
        backgroundImage:
          'repeating-linear-gradient(135deg, transparent, transparent 7px, rgba(120,120,130,0.09) 7px, rgba(120,120,130,0.09) 8px)',
      }}
      title={`Under maintenance${period.note ? ' · ' + period.note : ''}`}
    >
      <Wrench size={12} strokeWidth={1.75} className="shrink-0 text-gold-600 dark:text-gold-400" />
      <span className="truncate">Under maintenance</span>
    </div>
  )
}

export default MaintenanceBlock
