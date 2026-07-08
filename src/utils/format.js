export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatTime(isoDateTime) {
  return new Date(isoDateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}
