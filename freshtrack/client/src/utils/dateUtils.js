export function calculateDaysToExpiry(expiryDate) {
  const expiry = new Date(expiryDate)
  const now = new Date()
  expiry.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const ms = expiry.getTime() - now.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function formatDate(date) {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatINR(amount) {
  const n = Number(amount || 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function timeAgo(isoDate) {
  const dt = new Date(isoDate)
  const diffMs = Date.now() - dt.getTime()
  const mins = Math.floor(diffMs / (1000 * 60))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

