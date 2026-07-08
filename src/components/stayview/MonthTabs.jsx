import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const VISIBLE_MONTHS = 6

function shiftMonth(year, month, delta) {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

function MonthTabs({ activeYear, activeMonth, onSelect }) {
  const [windowStart, setWindowStart] = useState({ year: activeYear, month: activeMonth })

  const months = Array.from({ length: VISIBLE_MONTHS }, (_, i) =>
    shiftMonth(windowStart.year, windowStart.month, i)
  )

  return (
    <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-navy-100 bg-surface shadow-sm dark:border-navy-700">
      <button
        type="button"
        onClick={() => setWindowStart((w) => shiftMonth(w.year, w.month, -1))}
        className="flex w-10 shrink-0 items-center justify-center border-r border-navy-100 text-navy-300 transition-colors hover:bg-surface-muted hover:text-navy-600 dark:border-navy-700 dark:text-navy-500 dark:hover:bg-navy-800 dark:hover:text-navy-100"
        aria-label="Show earlier months"
      >
        <ChevronLeft size={16} strokeWidth={1.75} />
      </button>

      {months.map(({ year, month }, i) => {
        const isActive = year === activeYear && month === activeMonth
        const label = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect({ year, month })}
            className={[
              'flex-1 border-navy-100 py-3 text-sm font-medium transition-colors dark:border-navy-700',
              i < VISIBLE_MONTHS - 1 ? 'border-r' : '',
              isActive
                ? 'bg-navy text-white dark:bg-gold dark:text-navy-900'
                : 'text-navy-400 hover:bg-surface-muted hover:text-navy-600 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-100',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => setWindowStart((w) => shiftMonth(w.year, w.month, 1))}
        className="flex w-10 shrink-0 items-center justify-center border-l border-navy-100 text-navy-300 transition-colors hover:bg-surface-muted hover:text-navy-600 dark:border-navy-700 dark:text-navy-500 dark:hover:bg-navy-800 dark:hover:text-navy-100"
        aria-label="Show later months"
      >
        <ChevronRight size={16} strokeWidth={1.75} />
      </button>
    </div>
  )
}

export default MonthTabs
