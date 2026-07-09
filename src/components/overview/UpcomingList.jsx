import { formatDateShort } from '../../utils/dates'

function UpcomingList({ items, dateField, icon: Icon }) {
  if (items.length === 0) {
    return <p className="py-4 text-center text-sm text-navy-300 dark:text-navy-500">Nothing upcoming</p>
  }

  return (
    <div className="flex flex-col divide-y divide-navy-100 dark:divide-navy-700">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
                <Icon size={13} strokeWidth={1.75} />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-navy-600 dark:text-navy-50">{item.guestName}</p>
              <p className="text-xs text-navy-300 dark:text-navy-500">Room {item.roomNumber}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-navy-400 dark:text-navy-400">
            {formatDateShort(item[dateField])}
          </span>
        </div>
      ))}
    </div>
  )
}

export default UpcomingList
