const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  intent: { type: String },
  sentiment: { type: String },
  emotion: { type: String },
  emotionScore: { type: Number },
  emotions: { type: [{ emotion: String, score: Number }], default: [] },
  needsHandoff: { type: Boolean, default: false },
  isTemplate: { type: Boolean, default: false },
  images: { type: [String], default: [] }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ emotion: 1 });

module.exports = mongoose.model('Message', messageSchema);
