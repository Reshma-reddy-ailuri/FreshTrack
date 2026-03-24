const SalesHistory = require('../models/SalesHistory')
const { generateAISuggestion } = require('./claudeHelper')

function calculateDaysToExpiry(expiry_date) {
  const expiry = new Date(expiry_date)
  const now = new Date()
  expiry.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const ms = expiry.getTime() - now.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

async function getSalesVelocity(product_id, last_n_days) {
  const n = Math.max(1, Number(last_n_days || 30))
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - n)

  const agg = await SalesHistory.aggregate([
    { $match: { product_id, sale_date: { $gte: start, $lte: end } } },
    { $group: { _id: '$product_id', total: { $sum: '$quantity_sold' } } },
  ])

  const total = agg?.[0]?.total || 0
  return total / n
}

function daysToSellOut(qty_on_hand, sales_velocity) {
  const qty = Math.max(0, Number(qty_on_hand || 0))
  const vel = Number(sales_velocity || 0)
  if (vel <= 0) return Infinity
  return Math.ceil(qty / vel)
}

function getRiskScore(days_to_expiry, days_to_sellout) {
  const dte = Number(days_to_expiry)
  const dso = days_to_sellout === Infinity ? 999 : Number(days_to_sellout)

  let urgency = 0
  if (dte < 0) urgency = 100
  else if (dte <= 3) urgency = 95
  else if (dte <= 7) urgency = 85
  else if (dte <= 14) urgency = 70
  else if (dte <= 30) urgency = 55
  else urgency = 20

  let selloutRisk = 0
  if (dso <= 3) selloutRisk = 10
  else if (dso <= 7) selloutRisk = 25
  else if (dso <= 14) selloutRisk = 40
  else if (dso <= 30) selloutRisk = 55
  else selloutRisk = 70

  const score = Math.max(0, Math.min(100, Math.round(0.65 * urgency + 0.35 * selloutRisk)))

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

async function generateSuggestion(product, inventory, riskScore, salesHistory) {
  const days_to_expiry = calculateDaysToExpiry(inventory.expiry_date)
  const salesVelocity = await getSalesVelocity(product._id, 30)
  const days_to_sellout = daysToSellOut(inventory.quantity, salesVelocity)

  const riskData = {
    ...riskScore,
    days_to_expiry,
    days_to_sellout: days_to_sellout === Infinity ? 999 : days_to_sellout,
  }

  const ai = await generateAISuggestion(product, inventory, riskData, salesVelocity)

  const confidenceMap = { High: 0.85, Medium: 0.65, Low: 0.45 }
  const numericConfidence =
    typeof ai?.confidence === 'string' ? confidenceMap[ai.confidence] || 0.6 : 0.6

  return {
    product_id: product._id,
    inventory_id: inventory._id,
    product: { name: product.name, category: product.category, brand: product.brand },
    risk: {
      score: riskData.score,
      label: riskData.label,
      days_to_expiry,
      days_to_sellout: days_to_sellout === Infinity ? 999 : days_to_sellout,
    },
    suggestion_type: ai.suggestion_type || riskData.suggestion_type,
    suggestion_text: ai.suggestion_text || '',
    discount_percent: ai.discount_percent ?? null,
    confidence: ai.confidence || 'Medium',
    confidence_value: numericConfidence,
    units_at_risk: Number(ai.units_at_risk ?? inventory.quantity ?? 0),
    estimated_revenue_loss: Number(
      ai.estimated_revenue_loss ??
        Math.round((inventory.quantity || 0) * (product.unit_price || 0))
    ),
    reasoning: ai.reasoning || '',
    sales_velocity: salesVelocity,
    salesHistory: salesHistory || [],
  }
}

module.exports = {
  calculateDaysToExpiry,
  getSalesVelocity,
  daysToSellOut,
  getRiskScore,
  generateSuggestion,
}

