import { formatCurrency } from '../../utils/format'

function RevenueByRoomTypeChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="flex flex-col gap-4">
      {data.map((d) => (
        <div key={d.type}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-navy-600 dark:text-navy-50">{d.type}</span>
            <span className="text-navy-400 dark:text-navy-400">{formatCurrency(d.revenue)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gold-500 dark:bg-gold-400"
              style={{ width: `${(d.revenue / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default RevenueByRoomTypeChart
