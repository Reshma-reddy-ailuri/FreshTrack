const mongoose = require('mongoose')

const SuggestionLogSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    suggestion_type: { type: String, required: true, index: true },
    suggestion_text: { type: String, required: true },
    confidence: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
    units_at_risk: { type: Number, required: true, min: 0 },
    revenue_at_risk: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, default: 'actioned', index: true },
    created_at: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: false }
)

module.exports =
  mongoose.models.SuggestionLog ||
  mongoose.model('SuggestionLog', SuggestionLogSchema)

