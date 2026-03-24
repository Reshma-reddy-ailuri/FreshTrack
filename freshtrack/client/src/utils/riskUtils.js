export function getRiskScore(daysToExpiry, daysToSellout) {
  const dte = Number(daysToExpiry)
  const dso = Number.isFinite(daysToSellout) ? Number(daysToSellout) : 999

  let score = 20
  if (dte < 0) score = 100
  else if (dte <= 3) score = 95
  else if (dte <= 7) score = 85
  else if (dte <= 14) score = 70
  else if (dte <= 30) score = 55
  else score = 20

  if (dso > 30) score = Math.min(100, score + 10)
  if (dso > 60) score = Math.min(100, score + 10)

  let label = 'Low'
  if (dte < 0 || score >= 85) label = 'Critical'
  else if (score >= 70) label = 'High'
  else if (score >= 45) label = 'Medium'

  let suggestion_type = 'promote'
  if (label === 'Critical') suggestion_type = 'discount'
  else if (label === 'High') suggestion_type = 'bundle'
  else if (label === 'Medium') suggestion_type = 'promote'

  return { score, label, suggestion_type }
}

export function getStatusColor(daysRemaining) {
  const d = Number(daysRemaining)
  if (d < 0) return { row: 'bg-red-50', badge: 'bg-danger/10 text-danger border-danger/20' }
  if (d <= 7) return { row: 'bg-orange-50', badge: 'bg-warning/10 text-warning border-warning/20' }
  if (d <= 30) return { row: 'bg-yellow-50', badge: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' }
  return { row: 'bg-white', badge: 'bg-safe/10 text-safe border-safe/20' }
}

export function riskBadgeClasses(label) {
  if (label === 'Critical') return 'bg-danger/10 text-danger border-danger/20'
  if (label === 'High') return 'bg-warning/10 text-warning border-warning/20'
  if (label === 'Medium') return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
  return 'bg-safe/10 text-safe border-safe/20'
}

