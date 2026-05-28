const mongoose = require('mongoose');

const templateResponseSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  questions: { type: [String], required: true },
  text: { type: String, required: true },
  intent: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

templateResponseSchema.index({ productId: 1 });

module.exports = mongoose.model('TemplateResponse', templateResponseSchema);
