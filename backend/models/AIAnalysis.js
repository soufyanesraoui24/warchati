const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  intent: {
    type: String,
    default: 'unknown'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral', 'mixed'],
    default: 'neutral'
  },
  keywords: {
    type: [String],
    default: []
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'low'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  needsHuman: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
