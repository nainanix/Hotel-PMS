import Badge from '../ui/Badge'
import { formatDateLong } from '../../utils/dates'

function GuestCard({ guest }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-surface p-4 transition-colors hover:border-gold-300 dark:border-navy-700 dark:hover:border-gold-500/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-navy-600 dark:text-navy-50">
            {guest.name}
            {guest.inResidence && (
              <span className="ml-2 text-xs font-normal text-gold-600 dark:text-gold-400">In Residence</span>
            )}
          </p>
          <p className="text-xs text-navy-300 dark:text-navy-500">{guest.email}</p>
          <p className="text-xs text-navy-300 dark:text-navy-500">{guest.phone}</p>
        </div>
        <Badge status={guest.status} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3 text-sm dark:border-navy-700">
        <span className="text-navy-300 dark:text-navy-500">Last Stay</span>
        <span className="font-medium text-navy-600 dark:text-navy-50">
          {guest.lastStay ? formatDateLong(guest.lastStay) : 'No stays yet'}
        </span>
      </div>
    </div>
  )
}

export default GuestCard
