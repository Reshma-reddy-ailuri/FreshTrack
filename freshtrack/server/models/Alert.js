const mongoose = require('mongoose')

const AlertSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    inventory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    alert_type: {
      type: String,
      required: true,
      enum: ['expiring_soon', 'expired', 'slow_moving'],
      index: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['active', 'actioned', 'dismissed'],
      default: 'active',
      index: true,
    },
    created_at: { type: Date, required: true, default: () => new Date() },
    actioned_at: { type: Date, default: null },
  },
  { timestamps: false }
)

AlertSchema.index(
  { product_id: 1, inventory_id: 1, alert_type: 1, status: 1 },
  { partialFilterExpression: { status: 'active' } }
)

module.exports = mongoose.models.Alert || mongoose.model('Alert', AlertSchema)

