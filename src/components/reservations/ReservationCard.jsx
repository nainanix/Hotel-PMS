import Badge from '../ui/Badge'
import { formatDateShort } from '../../utils/dates'
import { formatCurrency } from '../../utils/format'

function ReservationCard({ reservation, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-navy-100 bg-surface p-4 transition-colors hover:border-gold-300 dark:border-navy-700 dark:hover:border-gold-500/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-navy-600 dark:text-navy-50">{reservation.guestName}</p>
          <p className="text-xs text-navy-300 dark:text-navy-500">{reservation.id}</p>
        </div>
        <Badge status={reservation.status} />
      </div>

      <div className="mt-4 flex items-start justify-between gap-2 text-sm">
        <div>
          <p className="text-navy-500 dark:text-navy-300">Room {reservation.roomNumber}</p>
          <p className="text-xs text-navy-300 dark:text-navy-500">{reservation.roomType}</p>
        </div>
        <div className="text-right">
          <p className="text-navy-500 dark:text-navy-300">
            {formatDateShort(reservation.checkIn)} → {formatDateShort(reservation.checkOut)}
          </p>
          <p className="text-xs text-navy-300 dark:text-navy-500">
            {reservation.nights} night{reservation.nights === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-navy-100 pt-3 dark:border-navy-700">
        <span className="text-base font-semibold text-navy-600 dark:text-navy-50">
          {formatCurrency(reservation.total)}
        </span>
      </div>
    </div>
  )
}

export default ReservationCard
