const Joi = require('joi');

const authSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'البريد الإلكتروني غير صحيح',
    'any.required': 'البريد الإلكتروني مطلوب'
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة'
  })
});

const productSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    'any.required': 'اسم المنتج مطلوب',
    'string.max': 'اسم المنتف طويل جداً'
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'السعر يجب أن يكون موجباً',
    'any.required': 'السعر مطلوب'
  }),
  description: Joi.string().allow('').max(2000).optional(),
  category: Joi.string().allow('').max(100).optional(),
  stock: Joi.number().integer().min(0).default(0),
  image: Joi.string().allow('').uri().optional()
});

const messageSchema = Joi.object({
  conversationId: Joi.string().required(),
  content: Joi.string().min(1).max(5000).required().messages({
    'any.required': 'محتوى الرسالة مطلوب'
  }),
  sender: Joi.string().valid('user', 'bot', 'customer').default('customer'),
  platform: Joi.string().valid('facebook', 'whatsapp', 'simulator').default('simulator')
});

const conversationSchema = Joi.object({
  customerName: Joi.string().min(1).max(200).required(),
  customerId: Joi.string().optional(),
  platform: Joi.string().valid('facebook', 'whatsapp', 'simulator').default('simulator'),
  productId: Joi.string().optional()
});

const aiQuerySchema = Joi.object({
  message: Joi.string().min(1).max(5000).required().messages({
    'any.required': 'الرسالة مطلوبة للتحليل'
  }),
  conversationId: Joi.string().optional()
});

const botSettingsSchema = Joi.object({
  autoReplyEnabled: Joi.boolean(),
  handoffOnNegative: Joi.boolean(),
  handoffConfidenceThreshold: Joi.number().min(0).max(1),
  language: Joi.string().valid('ar', 'fr', 'en'),
  businessName: Joi.string().max(200),
  businessHours: Joi.object({
    start: Joi.string().pattern(/^\d{2}:\d{2}$/),
    end: Joi.string().pattern(/^\d{2}:\d{2}$/)
  })
});

module.exports = { authSchema, productSchema, messageSchema, conversationSchema, aiQuerySchema, botSettingsSchema };
