const express = require('express')
const Product = require('../models/Product')
const Inventory = require('../models/Inventory')
const SalesHistory = require('../models/SalesHistory')
const Alert = require('../models/Alert')
const {
  calculateDaysToExpiry,
  getSalesVelocity,
  daysToSellOut,
  getRiskScore,
  generateSuggestion,
} = require('../utils/businessLogic')

const router = express.Router()

async function upsertAlert({ product, inventory, alert_type, message }) {
  const existing = await Alert.findOne({
    product_id: product._id,
    inventory_id: inventory._id,
    alert_type,
    status: 'active',
  })
  if (existing) return existing
  return Alert.create({
    product_id: product._id,
    inventory_id: inventory._id,
    alert_type,
    message,
    status: 'active',
    created_at: new Date(),
    actioned_at: null,
  })
}

router.get('/suggestions', async (req, res, next) => {
  try {
    const regenerate = String(req.query.regenerate || 'false') === 'true'

    const inventory = await Inventory.find({}).lean()
    const products = await Product.find({}).lean()
    const productById = new Map(products.map((p) => [String(p._id), p]))

    // pick the most urgent (earliest expiry) batch per product within <= 30 days window (or expired)
    const byProduct = new Map()
    for (const inv of inventory) {
      const days = calculateDaysToExpiry(inv.expiry_date)
      if (days > 30) continue
      const pid = String(inv.product_id)
      const cur = byProduct.get(pid)
      if (!cur || days < cur.days) byProduct.set(pid, { inv, days })
    }

    const suggestions = []

    for (const { inv, days } of byProduct.values()) {
      const product = productById.get(String(inv.product_id))
      if (!product) continue

      let primaryAlert = null

      const salesVelocity = await getSalesVelocity(product._id, 30)
      const dso = daysToSellOut(inv.quantity, salesVelocity)
      const riskScore = getRiskScore(days, dso)

      const salesHistory = await SalesHistory.find(
        { product_id: product._id },
        { quantity_sold: 1, sale_date: 1, customer_segment: 1, price: 1 }
      )
        .sort({ sale_date: -1 })
        .limit(30)
        .lean()

      const suggestion = await generateSuggestion(product, inv, riskScore, salesHistory)
      suggestions.push(suggestion)

      // Alerts: expired / expiring soon; plus slow moving (low velocity with stock)
      if (days < 0) {
        primaryAlert = await upsertAlert({
          product,
          inventory: inv,
          alert_type: 'expired',
          message: `${product.name} batch ${inv.batch_no} is expired (${Math.abs(
            days
          )} days past). Remove from shelf and initiate disposal/returns.`,
        })
      } else if (days <= 7) {
        primaryAlert = await upsertAlert({
          product,
          inventory: inv,
          alert_type: 'expiring_soon',
          message: `${product.name} batch ${inv.batch_no} expires in ${days} day(s). Consider discount/bundle to clear stock.`,
        })
      }

      const slowMoving = salesVelocity < 0.8 && inv.quantity > 25 && days >= 7 && days <= 30
      if (slowMoving) {
        // only set primary if we don't already have an expiry-based alert
        const slow = await upsertAlert({
          product,
          inventory: inv,
          alert_type: 'slow_moving',
          message: `${product.name} is slow-moving (~${salesVelocity.toFixed(
            2
          )} units/day) with ${inv.quantity} units on hand and ${days} days to expiry. Reposition and promote this week.`,
        })
        if (!primaryAlert) primaryAlert = slow
      }

      suggestion.alert_id = primaryAlert?._id || null
    }

    suggestions.sort((a, b) => a.risk.days_to_expiry - b.risk.days_to_expiry)

    // regenerate flag is accepted for the demo; suggestions are generated on-demand either way
    res.json({ regenerate, count: suggestions.length, items: suggestions })
  } catch (e) {
    next(e)
  }
})

module.exports = router

