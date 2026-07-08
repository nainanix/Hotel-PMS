import { toISODate } from '../../utils/dates'

function RoomRow({ room, rowIndex, daysInMonth, year, month, onCellClick }) {
  const todayStr = new Date().toDateString()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <>
      <div
        className="sticky left-0 z-10 flex flex-col justify-center border-b border-r border-navy-100 bg-surface px-4 dark:border-navy-700"
        style={{ gridColumn: 1, gridRow: rowIndex }}
      >
        <span className="text-sm font-semibold text-navy-600 dark:text-navy-50">Room {room.number}</span>
        <span className="text-xs text-navy-300 dark:text-navy-500">{room.type}</span>
      </div>

      {days.map((day) => {
        const date = new Date(year, month, day)
        const isToday = date.toDateString() === todayStr
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        return (
          <div
            key={day}
            onClick={() => onCellClick?.(room, toISODate(date))}
            className={[
              'cursor-pointer border-b border-r border-navy-50 transition-colors hover:bg-gold-50/60 dark:border-navy-800 dark:hover:bg-gold-500/10',
              isToday ? 'bg-gold-50/40 dark:bg-gold-500/10' : isWeekend ? 'bg-surface-muted/40 dark:bg-navy-800/30' : '',
            ].join(' ')}
            style={{ gridColumn: day + 1, gridRow: rowIndex }}
          />
        )
      })}
    </>
  )
}

export default RoomRow
