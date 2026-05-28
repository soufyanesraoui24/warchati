/**
 * seed_data.js
 * زرع بيانات تجريبية في MongoDB
 * المنتجات + ردود القوالب الجاهزة
 *
 * التشغيل: node seed_data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Product          = require('./models/Product');
const TemplateResponse = require('./models/TemplateResponse');

// ─── بيانات المنتجات التجريبية ────────────────────────────────────────────────
const PRODUCTS = [
    {
        name:        'قميص رجالي كلاسيكي',
        description: 'قميص رجالي بجودة عالية مناسب للعمل والمناسبات',
        category:    'قمصان',
        price:       2200,
        colors:      ['أبيض', 'أسود', 'رمادي', 'أزرق نيلي'],
        sizes:       ['S', 'M', 'L', 'XL', 'XXL'],
        stock:       50,
        isActive:    true
    },
    {
        name:        'تيشورت بوبلين صيفي',
        description: 'تيشورت خفيف وعملي للصيف، قطن 100%',
        category:    'تيشورتات',
        price:       1500,
        colors:      ['أبيض', 'أسود', 'رمادي', 'أحمر', 'أزرق', 'أخضر زيتي'],
        sizes:       ['S', 'M', 'L', 'XL', 'XXL'],
        stock:       120,
        isActive:    true
    },
    {
        name:        'بنطلون جينز رجالي',
        description: 'جينز ستريتش مريح وعملي لكل الأوقات',
        category:    'بناطيل',
        price:       3500,
        colors:      ['أزرق كلاسيكي', 'أسود', 'رمادي فاتح'],
        sizes:       ['36', '38', '40', '42', '44', '46', '48'],
        stock:       80,
        isActive:    true
    },
    {
        name:        'جاكيت كاجوال شتوي',
        description: 'جاكيت دافئ ومريح لفصل الشتاء، مقاوم للريح',
        category:    'جاكيتات',
        price:       5800,
        colors:      ['أسود', 'كاكي', 'رمادي غامق', 'أزرق بترولي'],
        sizes:       ['S', 'M', 'L', 'XL', 'XXL'],
        stock:       35,
        isActive:    true
    },
    {
        name:        'بلوزة نسائية فلورال',
        description: 'بلوزة نسائية أنيقة بنقشة ورود، مناسبة للخروجات',
        category:    'بلوزات',
        price:       2800,
        colors:      ['وردي', 'أبيض', 'أزرق فاتح'],
        sizes:       ['S', 'M', 'L', 'XL'],
        stock:       60,
        isActive:    true
    },
    {
        name:        'كنزة صوف رجالية',
        description: 'كنزة صوف دافئة بتصميم بسيط وأنيق',
        category:    'كنز',
        price:       3200,
        colors:      ['بيج', 'رمادي', 'أزرق داكن', 'بني'],
        sizes:       ['M', 'L', 'XL', 'XXL'],
        stock:       45,
        isActive:    true
    },
    {
        name:        'شورت رياضي',
        description: 'شورت رياضي خفيف للرياضة والترفيه',
        category:    'شورتات',
        price:       1200,
        colors:      ['أسود', 'رمادي', 'أزرق ملكي', 'أحمر'],
        sizes:       ['S', 'M', 'L', 'XL', 'XXL'],
        stock:       90,
        isActive:    true
    },
    {
        name:        'سروال جلابة رجالي',
        description: 'سروال قطني مريح للبيت والترفيه',
        category:    'سراويل',
        price:       1800,
        colors:      ['أبيض', 'بيج', 'رمادي فاتح'],
        sizes:       ['M', 'L', 'XL', 'XXL'],
        stock:       70,
        isActive:    true
    }
];

// ─── ردود القوالب الجاهزة حسب النية ──────────────────────────────────────────
const TEMPLATES = [
    {
        intent:   'greeting',
        text:     'وعليكم السلام ورحمة الله 😊 أهلاً بيك في متجر وردة! واش نقدر نعاونك اليوم؟ عندنا تشكيلة رائعة وعروض حصرية. لا تتردد تسألني على أي منتوج! 🛍️',
        isActive: true
    },
    {
        intent:   'delivery_inquiry',
        text:     'التوصيل متوفر لكامل الـ 58 ولاية في الجزائر 🚚 المدة بين 2 و5 أيام عمل حسب الولاية. والدفع عند الاستلام دائماً، ما تدفعش حتى تشوف البضاعة بعينيك! واش راك مهتم بمنتوج معين؟',
        isActive: true
    },
    {
        intent:   'payment_inquiry',
        text:     'الدفع عند الاستلام فقط 💳✅ ما عندناش دفع مسبق. تستلم البضاعة وتشوفها، كي تعجبك تدفع. بسيطة وأمينة! واش تحب تطلب؟',
        isActive: true
    }
];

// ─── الدالة الرئيسية للزرع ────────────────────────────────────────────────────
async function seedDatabase() {
    console.log('🌱 بدء زرع البيانات في قاعدة البيانات...\n');

    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ تم الاتصال بـ MongoDB بنجاح');

        // ── زرع المنتجات ──
        await Product.deleteMany({});
        const insertedProducts = await Product.insertMany(PRODUCTS);
        console.log(`\n📦 تم زرع ${insertedProducts.length} منتج:`);
        insertedProducts.forEach(p => console.log(`   • ${p.name} - ${p.price} دج`));

        // ── زرع القوالب ──
        await TemplateResponse.deleteMany({});
        const insertedTemplates = await TemplateResponse.insertMany(TEMPLATES);
        console.log(`\n📋 تم زرع ${insertedTemplates.length} قالب رد جاهز:`);
        insertedTemplates.forEach(t => console.log(`   • ${t.intent}`));

        console.log('\n🎉 اكتمل الزرع بنجاح!');
        console.log('─'.repeat(50));
        console.log('يمكنك الآن تشغيل السيرفر: npm start');

    } catch (error) {
        console.error('❌ خطأ في الزرع:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedDatabase();
