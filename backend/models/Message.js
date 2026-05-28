const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  intent: { type: String },
  sentiment: { type: String },
  isTemplate: { type: Boolean, default: false },
  images: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
