const express = require('express')
const Alert = require('../models/Alert')
const Inventory = require('../models/Inventory')
const Product = require('../models/Product')
const SuggestionLog = require('../models/SuggestionLog')
const { calculateDaysToExpiry } = require('../utils/businessLogic')

const router = express.Router()

function urgencyRank(alert_type, daysRemaining) {
  if (alert_type === 'expired') return 0
  if (alert_type === 'expiring_soon') return 1
  if (daysRemaining <= 7) return 2
  if (alert_type === 'slow_moving') return 3
  return 4
}

router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = await Alert.find({ status: 'active' })
      .sort({ created_at: -1 })
      .lean()

    const invIds = alerts.map((a) => a.inventory_id)
    const prodIds = alerts.map((a) => a.product_id)

    const [inv, prod] = await Promise.all([
      Inventory.find({ _id: { $in: invIds } }).lean(),
      Product.find({ _id: { $in: prodIds } }).lean(),
    ])

    const invById = new Map(inv.map((i) => [String(i._id), i]))
    const prodById = new Map(prod.map((p) => [String(p._id), p]))

    const items = alerts
      .map((a) => {
        const inventory = invById.get(String(a.inventory_id))
        const product = prodById.get(String(a.product_id))
        const days_remaining = inventory ? calculateDaysToExpiry(inventory.expiry_date) : null
        return {
          ...a,
          product,
          inventory,
          days_remaining,
          urgency: urgencyRank(a.alert_type, days_remaining ?? 999),
        }
      })
      .sort((x, y) => x.urgency - y.urgency || (x.days_remaining ?? 999) - (y.days_remaining ?? 999))

    res.json({ count: items.length, items })
  } catch (e) {
    next(e)
  }
})

router.post('/alerts/:id/action', async (req, res, next) => {
  try {
    const id = req.params.id
    const action = String(req.body?.action || '')
    if (!['actioned', 'dismissed'].includes(action)) {
      return res.status(400).json({ error: 'invalid_action' })
    }

    const alert = await Alert.findById(id)
    if (!alert) return res.status(404).json({ error: 'not_found' })

    alert.status = action
    alert.actioned_at = new Date()
    await alert.save()

    const [inventory, product] = await Promise.all([
      Inventory.findById(alert.inventory_id).lean(),
      Product.findById(alert.product_id).lean(),
    ])

    if (action === 'actioned' && inventory && product) {
      const units = Number(inventory.quantity || 0)
      const revenue = Math.round(units * Number(product.unit_price || 0))
      const suggestion_type =
        alert.alert_type === 'expired' || alert.alert_type === 'expiring_soon'
          ? 'discount'
          : alert.alert_type === 'slow_moving'
            ? 'reposition'
            : 'promote'

      await SuggestionLog.create({
        product_id: product._id,
        suggestion_type,
        suggestion_text: alert.message,
        confidence: alert.alert_type === 'expired' ? 'High' : 'Medium',
        units_at_risk: units,
        revenue_at_risk: revenue,
        status: 'actioned',
        created_at: new Date(),
      })
    }

    res.json({ ok: true, id, status: alert.status })
  } catch (e) {
    next(e)
  }
})

module.exports = router

