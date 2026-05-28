const mongoose = require('mongoose');

const botTemplateSchema = new mongoose.Schema({
  intent: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BotTemplate', botTemplateSchema);
