const express = require('express')
const Product = require('../models/Product')
const Inventory = require('../models/Inventory')
const { calculateDaysToExpiry } = require('../utils/businessLogic')

const router = express.Router()

function bucket(days) {
  if (days < 0) return 'expired'
  if (days <= 7) return 'expiring_7'
  if (days <= 30) return 'expiring_30'
  return 'safe'
}

router.get('/analytics/expiry-by-category', async (req, res, next) => {
  try {
    const products = await Product.find({}).lean()
    const productById = new Map(products.map((p) => [String(p._id), p]))
    const inventory = await Inventory.find({}).lean()

    const byCategory = new Map()
    for (const inv of inventory) {
      const p = productById.get(String(inv.product_id))
      if (!p) continue
      const days = calculateDaysToExpiry(inv.expiry_date)
      const b = bucket(days)
      const row = byCategory.get(p.category) || {
        category: p.category,
        expired: 0,
        expiring_7: 0,
        expiring_30: 0,
        safe: 0,
      }
      row[b] += 1
      byCategory.set(p.category, row)
    }

    res.json(Array.from(byCategory.values()).sort((a, b) => a.category.localeCompare(b.category)))
  } catch (e) {
    next(e)
  }
})

router.get('/analytics/revenue-at-risk', async (req, res, next) => {
  try {
    const products = await Product.find({}).lean()
    const productById = new Map(products.map((p) => [String(p._id), p]))
    const inventory = await Inventory.find({}).lean()

    let total = 0
    const byCategory = new Map()

    for (const inv of inventory) {
      const p = productById.get(String(inv.product_id))
      if (!p) continue
      const days = calculateDaysToExpiry(inv.expiry_date)
      if (days > 30) continue
      const revenue = Number(inv.quantity || 0) * Number(p.unit_price || 0)
      total += revenue
      const row = byCategory.get(p.category) || { category: p.category, value: 0 }
      row.value += revenue
      byCategory.set(p.category, row)
    }

    // trend: near-expiry batch count for each day in last 30 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const trend_last_30_days = []
    for (let i = 29; i >= 0; i--) {
      const day = new Date(today)
      day.setDate(day.getDate() - i)
      const asOf = new Date(day)

      let count = 0
      for (const inv of inventory) {
        const expiry = new Date(inv.expiry_date)
        expiry.setHours(0, 0, 0, 0)
        const ms = expiry.getTime() - asOf.getTime()
        const daysToExpiry = Math.round(ms / (1000 * 60 * 60 * 24))
        if (daysToExpiry <= 30) count++
      }

      trend_last_30_days.push({
        date: day.toISOString().slice(0, 10),
        near_expiry_batches: count,
      })
    }

    res.json({
      total: Math.round(total),
      by_category: Array.from(byCategory.values())
        .map((r) => ({ ...r, value: Math.round(r.value) }))
        .sort((a, b) => b.value - a.value),
      trend_last_30_days,
    })
  } catch (e) {
    next(e)
  }
})

module.exports = router

