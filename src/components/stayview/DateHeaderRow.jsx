function DateHeaderRow({ days, year, month }) {
  const todayStr = new Date().toDateString()

  return (
    <>
      {days.map((day) => {
        const date = new Date(year, month, day)
        const isToday = date.toDateString() === todayStr
        const isWeekend = date.getDay() === 0 || date.getDay() === 6

        return (
          <div
            key={day}
            className={[
              'flex flex-col items-center justify-center border-b border-r border-navy-50 text-xs dark:border-navy-800',
              isToday
                ? 'border-b-2 border-b-gold bg-gold-50 font-semibold text-gold-700 dark:bg-gold-500/10 dark:text-gold-400'
                : isWeekend
                  ? 'bg-surface-muted/60 text-navy-300 dark:bg-navy-800/40 dark:text-navy-500'
                  : 'text-navy-300 dark:text-navy-500',
            ].join(' ')}
            style={{ gridColumn: day + 1, gridRow: 1 }}
          >
            <span className="uppercase">{date.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
            <span className={`text-sm ${isToday ? 'text-gold-700 dark:text-gold-300' : 'text-navy-500 dark:text-navy-200'}`}>
              {day}
            </span>
          </div>
        )
      })}
    </>
  )
}

export default DateHeaderRow
