const mongoose = require('mongoose')

const SalesHistorySchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    quantity_sold: { type: Number, required: true, min: 0 },
    sale_date: { type: Date, required: true, index: true },
    customer_segment: {
      type: String,
      required: true,
      enum: ['Walk-in', 'Online', 'Wholesale', 'Premium', 'Budget'],
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
)

SalesHistorySchema.index({ product_id: 1, sale_date: 1 })

module.exports =
  mongoose.models.SalesHistory || mongoose.model('SalesHistory', SalesHistorySchema)

