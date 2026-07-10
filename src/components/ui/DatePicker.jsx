import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateLong, parseISODate, toISODate } from '../../utils/dates'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function buildCalendarDays(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    return { date, inCurrentMonth: date.getMonth() === month }
  })
}

function DatePicker({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(() => {
    const d = value ? parseISODate(value) : new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  function handleOpen() {
    const d = value ? parseISODate(value) : new Date()
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
    setOpen(true)
  }

  function shiftMonth(delta) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const days = buildCalendarDays(cursor.year, cursor.month)
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const todayISO = toISODate(new Date())

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-between rounded-lg border border-navy-100 bg-surface px-3 py-2 text-sm text-navy-600 transition-colors hover:border-gold-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold dark:border-navy-700 dark:text-navy-100 dark:hover:border-gold-500/50"
      >
        <span>{value ? formatDateLong(value) : 'Select date'}</span>
        <CalendarIcon size={15} strokeWidth={1.75} className="shrink-0 text-gold-600 dark:text-gold-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-navy-100/10 bg-surface p-3 shadow-2xl dark:border-white/10">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="rounded-md p-1 text-navy-300 transition-colors hover:bg-surface-muted hover:text-navy-600 dark:text-navy-500 dark:hover:bg-navy-800 dark:hover:text-navy-100"
              >
                <ChevronLeft size={14} strokeWidth={1.75} />
              </button>
              <span className="text-xs font-semibold text-navy-600 dark:text-navy-50">{monthLabel}</span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="rounded-md p-1 text-navy-300 transition-colors hover:bg-surface-muted hover:text-navy-600 dark:text-navy-500 dark:hover:bg-navy-800 dark:hover:text-navy-100"
              >
                <ChevronRight size={14} strokeWidth={1.75} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
              {WEEKDAY_LABELS.map((label, i) => (
                <span key={i} className="text-[10px] font-medium uppercase text-navy-300 dark:text-navy-500">
                  {label}
                </span>
              ))}
              {days.map(({ date, inCurrentMonth }, i) => {
                const iso = toISODate(date)
                const isSelected = iso === value
                const isToday = iso === todayISO
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(iso)
                      setOpen(false)
                    }}
                    className={[
                      'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors',
                      isSelected
                        ? 'bg-gold font-semibold text-navy-900'
                        : isToday
                          ? 'border border-gold text-gold-700 dark:text-gold-400'
                          : inCurrentMonth
                            ? 'text-navy-600 hover:bg-surface-muted dark:text-navy-200 dark:hover:bg-navy-800'
                            : 'text-navy-200 hover:bg-surface-muted dark:text-navy-700 dark:hover:bg-navy-800',
                    ].join(' ')}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DatePicker
