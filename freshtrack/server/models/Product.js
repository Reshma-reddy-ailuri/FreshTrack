const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Dairy', 'Bakery', 'Produce', 'Beverages', 'Frozen', 'Snacks'],
      index: true,
    },
    barcode: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true, trim: true },
    shelf_life_days: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema)

