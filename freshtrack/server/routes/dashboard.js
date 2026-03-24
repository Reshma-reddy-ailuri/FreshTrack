const express = require('express')
const Product = require('../models/Product')
const Inventory = require('../models/Inventory')
const { calculateDaysToExpiry } = require('../utils/businessLogic')

const router = express.Router()

router.get('/dashboard-summary', async (req, res, next) => {
  try {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const products = await Product.find({}, { unit_price: 1 }).lean()
    const priceById = new Map(products.map((p) => [String(p._id), p.unit_price]))

    const inventory = await Inventory.find({}, { product_id: 1, quantity: 1, expiry_date: 1 })
      .lean()

    const perProduct = new Map()
    for (const inv of inventory) {
      const pid = String(inv.product_id)
      const days = calculateDaysToExpiry(inv.expiry_date)
      const existing = perProduct.get(pid)
      if (!existing) perProduct.set(pid, { minDays: days, qty: inv.quantity })
      else {
        existing.minDays = Math.min(existing.minDays, days)
        existing.qty += inv.quantity
      }
    }

    let expired = 0
    let expiring_7 = 0
    let expiring_30 = 0
    let revenue_at_risk = 0

    for (const [pid, row] of perProduct.entries()) {
      if (row.minDays < 0) expired++
      else if (row.minDays <= 7) expiring_7++
      else if (row.minDays <= 30) expiring_30++

      if (row.minDays <= 30) {
        const unit = Number(priceById.get(pid) || 0)
        revenue_at_risk += Number(row.qty || 0) * unit
      }
    }

    res.json({
      total_skus: await Product.countDocuments({}),
      expiring_7,
      expiring_30,
      expired,
      revenue_at_risk: Math.round(revenue_at_risk),
    })
  } catch (e) {
    next(e)
  }
})

module.exports = router

