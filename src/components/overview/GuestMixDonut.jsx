const STROKE_CLASS = {
  VIP: 'stroke-gold-500 dark:stroke-gold-400',
  Returning: 'stroke-navy-400',
  Corporate: 'stroke-navy-600 dark:stroke-navy-200',
  New: 'stroke-status-progress',
}

const DOT_CLASS = {
  VIP: 'bg-gold-500 dark:bg-gold-400',
  Returning: 'bg-navy-400',
  Corporate: 'bg-navy-600 dark:bg-navy-200',
  New: 'bg-status-progress',
}

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function GuestMixDonut({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1
  let offsetAccum = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" className="stroke-surface-muted" strokeWidth="14" />
          {data.map((d) => {
            const fraction = d.count / total
            const dash = fraction * CIRCUMFERENCE
            const dashArray = `${dash} ${CIRCUMFERENCE - dash}`
            const dashOffset = -offsetAccum
            offsetAccum += dash
            return (
              <circle
                key={d.status}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                className={STROKE_CLASS[d.status] ?? 'stroke-navy-300'}
                strokeWidth="14"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
              />
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-navy-600 dark:text-navy-50">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-navy-300 dark:text-navy-500">Guests</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 text-sm">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_CLASS[d.status] ?? 'bg-navy-300'}`} />
            <span className="text-navy-600 dark:text-navy-50">{d.status}</span>
            <span className="text-navy-300 dark:text-navy-500">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GuestMixDonut
