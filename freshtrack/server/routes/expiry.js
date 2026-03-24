const express = require('express')
const Product = require('../models/Product')
const Inventory = require('../models/Inventory')
const { calculateDaysToExpiry } = require('../utils/businessLogic')

const router = express.Router()

function statusFromDays(days) {
  if (days < 0) return 'Expired'
  if (days <= 7) return 'Expiring Soon'
  if (days <= 30) return 'Near Expiry'
  return 'Safe'
}

router.get('/expiry-list', async (req, res, next) => {
  try {
    const filter = String(req.query.filter || 'all') // 7|30|expired|all
    const category = String(req.query.category || '').trim()
    const search = String(req.query.search || '').trim()
    const page = Math.max(1, Number(req.query.page || 1))
    const limit = Math.min(50, Math.max(5, Number(req.query.limit || 20)))
    const skip = (page - 1) * limit

    const productQuery = {}
    if (category) productQuery.category = category
    if (search) productQuery.name = { $regex: search, $options: 'i' }

    const products = await Product.find(productQuery, {
      name: 1,
      category: 1,
      brand: 1,
      unit_price: 1,
    }).lean()

    const productIds = products.map((p) => p._id)
    const productById = new Map(products.map((p) => [String(p._id), p]))

    const invQuery = { product_id: { $in: productIds } }
    const allInv = await Inventory.find(invQuery).lean()

    // compute days and apply filter in-memory (small demo dataset)
    const enriched = allInv
      .map((inv) => {
        const p = productById.get(String(inv.product_id))
        const days_remaining = calculateDaysToExpiry(inv.expiry_date)
        return {
          _id: inv._id,
          product_id: inv.product_id,
          product: p,
          batch_no: inv.batch_no,
          quantity: inv.quantity,
          location: inv.location,
          mfg_date: inv.mfg_date,
          expiry_date: inv.expiry_date,
          days_remaining,
          status: statusFromDays(days_remaining),
        }
      })
      .filter((row) => {
        if (filter === 'expired') return row.days_remaining < 0
        if (filter === '7') return row.days_remaining >= 0 && row.days_remaining <= 7
        if (filter === '30') return row.days_remaining >= 0 && row.days_remaining <= 30
        return true
      })
      .sort((a, b) => a.days_remaining - b.days_remaining)

    const total = enriched.length
    const items = enriched.slice(skip, skip + limit)

    res.json({
      page,
      limit,
      total,
      items,
    })
  } catch (e) {
    next(e)
  }
})

module.exports = router

