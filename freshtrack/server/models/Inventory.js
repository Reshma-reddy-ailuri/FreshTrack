const mongoose = require('mongoose')

const InventorySchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    batch_no: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    mfg_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true, index: true },
    location: {
      type: String,
      required: true,
      enum: ['Shelf A', 'Warehouse', 'Aisle 3', 'Aisle 1', 'Cold Room'],
      index: true,
    },
  },
  { timestamps: true }
)

InventorySchema.index({ product_id: 1, batch_no: 1 }, { unique: true })

module.exports =
  mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema)

