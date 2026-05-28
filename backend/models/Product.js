/**
 * Product.js - نموذج المنتجات في MongoDB
 * يُستخدم من طرف aiPipelineService لجلب سياق المنتجات الحقيقية
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type:     String,
            required: true,
            trim:     true
        },
        description: {
            type:    String,
            default: ''
        },
        category: {
            type:    String,
            default: 'عام'
        },
        price: {
            type:     Number,
            required: true,
            min:      0
        },
        colors: {
            type:    [String],
            default: []
        },
        sizes: {
            type:    [String],
            default: []
        },
        stock: {
            type:    Number,
            default: 0,
            min:     0
        },
        images: {
            type:    [String],
            default: []
        },
        isActive: {
            type:    Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// فهرس نصي للبحث السريع بالاسم والوصف والفئة
productSchema.index(
    { name: 'text', description: 'text', category: 'text' },
    { default_language: 'none' }   // دعم العربية بدون stemmer إنجليزي
);

module.exports = mongoose.model('Product', productSchema);
