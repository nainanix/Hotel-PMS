import { parseISODate } from '../../utils/dates'

const STATUS_BLOCK_STYLES = {
  'checked-in': 'bg-gold-400 border-gold-500 text-navy-900',
  confirmed:
    'bg-gold-100 border-gold-300 text-gold-800 dark:bg-gold-500/15 dark:border-gold-500/40 dark:text-gold-300',
  pending:
    'border-dashed border-navy-200 bg-navy-50 text-navy-400 dark:border-navy-600 dark:bg-navy-700/60 dark:text-navy-300',
  'checked-out':
    'bg-navy-50 border-navy-100 text-navy-300 dark:bg-navy-700/40 dark:border-navy-700 dark:text-navy-400',
}

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

  const styles = STATUS_BLOCK_STYLES[reservation.status] ?? STATUS_BLOCK_STYLES.confirmed

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(reservation)
      }}
      className={`m-1.5 flex cursor-pointer items-center overflow-hidden rounded-md border px-2 text-xs font-medium shadow-sm transition-transform hover:scale-[1.02] ${styles}`}
      style={{ gridColumn: `${gridColumnStart} / ${gridColumnEnd}`, gridRow: rowIndex }}
      title={`${reservation.guestName} · Room ${roomNumber} · ${reservation.status}`}
    >
      <span className="truncate">{reservation.guestName}</span>
    </div>
  )
}

export default StayBlock
