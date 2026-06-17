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
  },
  fallbackMessage: {
    type: String,
    default: 'عفواً، ما فهمتش الرسالة. تقدر تعيد صياغتها؟ أو اتصل بنا على الرقم المخصص للمساعدة.'
  },
  replyDelay: {
    type: Number,
    default: 2,
    min: 0,
    max: 60
  },
  followUpEnabled: {
    type: Boolean,
    default: false
  },
  followUpDelay: {
    type: Number,
    default: 30,
    min: 1,
    max: 1440
  },
  followUpMessage: {
    type: String,
    default: 'مرحباً، مازال المهتم بالمنتج؟ العرض لسة متوفر. نحن هنا لمساعدتك!'
  }
}, { timestamps: true });

module.exports = mongoose.model('BotSettings', botSettingsSchema);
