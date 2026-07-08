const STATUS_STYLES = {
  // Reservation statuses
  confirmed: 'bg-status-confirmed/10 text-status-confirmed',
  pending: 'bg-navy-400/10 text-navy-500 dark:text-navy-300',
  'checked-in': 'bg-gold/15 text-gold-700 dark:text-gold-400',
  'checked-out': 'bg-navy-400/10 text-navy-500 dark:text-navy-300',
  cancelled: 'bg-status-urgent/10 text-status-urgent',

  // Room occupancy statuses
  available: 'bg-status-confirmed/10 text-status-confirmed',
  occupied: 'bg-gold/15 text-gold-700 dark:text-gold-400',
  maintenance: 'bg-status-urgent/10 text-status-urgent',

  // Housekeeping cleaning statuses
  clean: 'bg-status-confirmed/10 text-status-confirmed',
  dirty: 'bg-status-urgent/10 text-status-urgent',
  'in-progress': 'bg-status-progress/10 text-status-progress',

  // Guest statuses
  vip: 'bg-gold/15 text-gold-700 dark:text-gold-400',
  returning: 'bg-navy-400/10 text-navy-500 dark:text-navy-300',
  corporate: 'bg-navy-400/10 text-navy-500 dark:text-navy-300',
  new: 'bg-status-progress/10 text-status-progress',
}

function Badge({ status, children }) {
  const key = String(status ?? '').toLowerCase()
  const styles = STATUS_STYLES[key] ?? 'bg-navy-400/10 text-navy-500 dark:text-navy-300'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles}`}
    >
      {children ?? status}
    </span>
  )
}

export default Badge
