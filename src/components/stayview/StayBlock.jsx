import { parseISODate } from '../../utils/dates'

// All reservation blocks share one consistent gold treatment — a soft tint
// at rest that deepens to a solid gold on hover — rather than a different
// color per status, so the calendar reads as one coherent surface. Past
// (checked-out) stays fade further to signal history without switching hue.
const BASE_STYLES =
  'bg-gold-100 border-gold-300 text-gold-800 hover:bg-gold-400 hover:border-gold-500 hover:text-navy-900 dark:bg-gold-500/15 dark:border-gold-500/40 dark:text-gold-300 dark:hover:bg-gold-400 dark:hover:border-gold-500 dark:hover:text-navy-900'

const PAST_STYLES =
  'bg-gold-500/10 border-gold-500/25 text-gold-800/60 hover:bg-gold-400/80 hover:border-gold-500 hover:text-navy-900 dark:bg-gold-500/5 dark:border-gold-500/15 dark:text-gold-300/50 dark:hover:bg-gold-400/80 dark:hover:text-navy-900'

const PENDING_EXTRA = 'border-dashed'

const MS_PER_DAY = 1000 * 60 * 60 * 24

function StayBlock({ reservation, rowIndex, roomNumber, year, month, daysInMonth, onClick }) {
  const monthStart = new Date(year, month, 1)
  const monthEndExclusive = new Date(year, month + 1, 1)
  const checkIn = parseISODate(reservation.checkIn)
  const checkOut = parseISODate(reservation.checkOut)

  const clampedStart = checkIn < monthStart ? monthStart : checkIn
  const clampedEnd = checkOut > monthEndExclusive ? monthEndExclusive : checkOut

  const startOffset = Math.round((clampedStart - monthStart) / MS_PER_DAY)
  const endOffset = Math.round((clampedEnd - monthStart) / MS_PER_DAY)
  if (endOffset <= startOffset) return null

  const gridColumnStart = startOffset + 2
  const gridColumnEnd = Math.min(endOffset, daysInMonth) + 2

  const styles = [
    reservation.status === 'checked-out' ? PAST_STYLES : BASE_STYLES,
    reservation.status === 'pending' ? PENDING_EXTRA : '',
  ].join(' ')

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(reservation)
      }}
      className={`m-1.5 flex cursor-pointer items-center overflow-hidden rounded-md border px-2 text-xs font-medium shadow-sm transition-colors transition-transform duration-150 hover:scale-[1.02] ${styles}`}
      style={{ gridColumn: `${gridColumnStart} / ${gridColumnEnd}`, gridRow: rowIndex }}
      title={`${reservation.guestName} · Room ${roomNumber} · ${reservation.status}`}
    >
      <span className="truncate">{reservation.guestName}</span>
    </div>
  )
}

export default StayBlock
