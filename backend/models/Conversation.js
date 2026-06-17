const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  senderId: { type: String, required: true },
  name: { type: String },
  status: { type: String, default: 'ACTIVE' },
  unread: { type: Number, default: 0 },
  aiActive: { type: Boolean, default: true },
  welcomeSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
