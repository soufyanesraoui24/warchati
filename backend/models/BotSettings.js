const mongoose = require('mongoose');

const botSettingsSchema = new mongoose.Schema({
  botName: {
    type: String,
    default: 'وردة'
  },
  autoReplyEnabled: {
    type: Boolean,
    default: true
  },
  languageStyle: {
    type: String,
    enum: ['darija', 'fossha', 'mixed'],
    default: 'mixed'
  },
  requireApprovalBeforeSend: {
    type: Boolean,
    default: true
  },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    timezone: { type: String, default: 'Africa/Algiers' }
  },
  handoffOnNegativeSentiment: {
    type: Boolean,
    default: true
  },
  welcomeMessage: {
    type: String,
    default: 'السلام عليكم! أنا وردة، المساعدة الذكية للمتجر. كيف نقدر نخدمك؟'
  },
  afterHoursMessage: {
    type: String,
    default: 'السلام عليكم! وقت العمل الرسمي من 09:00 إلى 18:00. غدوا نردو عليك في أقرب وقت.'
  }
}, { timestamps: true });

module.exports = mongoose.model('BotSettings', botSettingsSchema);
