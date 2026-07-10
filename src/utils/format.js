export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatTime(isoDateTime) {
  return new Date(isoDateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Formats a bare "HH:MM" time-of-day string (from an <input type="time">)
// as a 12-hour clock reading, e.g. "14:00" -> "2:00 PM".
export function formatTimeOfDay(hhmm) {
  if (!hhmm) return ''
  const [hours, minutes] = hhmm.split(':').map(Number)
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}
