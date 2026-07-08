export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function toISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function offsetISODate(days, from = new Date()) {
  return toISODate(addDays(from, days))
}

export function parseISODate(isoString) {
  const [year, month, day] = isoString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateLong(isoString) {
  return parseISODate(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(isoString) {
  return parseISODate(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

export function isToday(isoString) {
  return isSameDay(parseISODate(isoString), new Date())
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getMonthDates(year, month) {
  const daysInMonth = getDaysInMonth(year, month)
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
}

export function nightsBetween(checkInISO, checkOutISO) {
  const msPerDay = 1000 * 60 * 60 * 24
  const diff = parseISODate(checkOutISO) - parseISODate(checkInISO)
  return Math.round(diff / msPerDay)
}
