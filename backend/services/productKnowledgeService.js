/**
 * productKnowledgeService.js
 * خدمة البحث في قاعدة بيانات المنتجات (MongoDB) ومعالجتها
 */

const Product = require('../models/Product');

// قائمة الولايات الجزائرية المدعومة
const SUPPORTED_WILAYAS = [
    'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية',
    'بسكرة', 'بشار', 'البليدة', 'البويرة', 'تمنراست', 'تبسة',
    'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر', 'الجلفة', 'جيجل',
    'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة',
    'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'وهران', 'ورقلة',
    'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف',
    'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة', 'سوق أهراس',
    'تيبازة', 'ميلة', 'عين الدفلى', 'عين تموشنت', 'غرداية',
    'غليزان', 'المغير', 'المنيعة', 'أولاد جلال', 'برج باجي مختار',
    'بني عباس', 'تميمون', 'تقرت', 'جانت', 'عين صالح', 'عين قزام'
].map(w => w.toLowerCase());

/**
 * البحث عن منتجات مرتبطة بالكلمات المفتاحية
 * @param {string[]} keywords - كلمات مفتاحية من رسالة الزبون
 * @returns {Promise<Array>} - مصفوفة المنتجات المتطابقة
 */
async function findRelevantProducts(keywords) {
    if (!keywords || keywords.length === 0) {
        return [];
    }

    try {
        const regexPattern = keywords.join('|');
        const products = await Product.find({
            isActive: true,
            $or: [
                { name:        { $regex: regexPattern, $options: 'i' } },
                { description: { $regex: regexPattern, $options: 'i' } },
                { category:    { $regex: regexPattern, $options: 'i' } }
            ]
        }).limit(5).lean();

        return products || [];
    } catch (error) {
        console.error('[ProductKnowledge] Error searching for products:', error.message);
        return [];
    }
}

/**
 * التحقق من توفر المقاس لمنتج معين
 * @param {string} productId - معرف المنتج
 * @param {string} size - المقاس المطلوب
 * @returns {Promise<{available: boolean, productName?: string}>}
 */
async function checkSizeAvailability(productId, size) {
    try {
        const product = await Product.findById(productId).lean();
        if (!product) {
            return { available: false };
        }

        const sizeList = (product.sizes || []).map(s => s.toLowerCase());
        const isAvailable = sizeList.includes(size.toLowerCase()) && product.stock > 0;

        return {
            available:   isAvailable,
            productName: product.name
        };
    } catch (error) {
        console.error('[ProductKnowledge] Error checking size:', error.message);
        return { available: false };
    }
}

/**
 * التحقق من إمكانية التوصيل إلى ولاية معينة
 * @param {string} wilaya - اسم الولاية
 * @returns {Promise<{available: boolean, message: string}>}
 */
async function checkDeliveryAvailability(wilaya) {
    try {
        const lowerWilaya = wilaya.trim().toLowerCase();
        const isSupported = SUPPORTED_WILAYAS.some(w => w.includes(lowerWilaya) || lowerWilaya.includes(w));

        if (isSupported) {
            return {
                available: true,
                message:   `التوصيل متوفر إلى ${wilaya} ✅ الدفع عند الاستلام.`
            };
        }

        return {
            available: false,
            message:   `نأسف، التوصيل إلى ${wilaya} غير متوفر حالياً. تواصل معنا لترتيب طريقة بديلة.`
        };
    } catch (error) {
        console.error('[ProductKnowledge] Error checking delivery:', error.message);
        return {
            available: false,
            message:   'تعذر التحقق من التوصيل. حاول مرة أخرى.'
        };
    }
}

/**
 * تنسيق بيانات المنتجات لاستخدامها في سياق AI
 * @param {Array} products - مصفوفة المنتجات من MongoDB
 * @returns {string} - نص منسق جاهز للإرسال إلى النموذج
 */
function formatProductContext(products) {
    if (!products || products.length === 0) {
        return 'لا توجد منتجات متطابقة في قاعدة البيانات.';
    }

    return products.map(p => {
        const lines = [`📦 المنتج: ${p.name}`];
        if (p.price)          lines.push(`💰 السعر: ${p.price} دج`);
        if (p.colors?.length) lines.push(`🎨 الألوان: ${p.colors.join(', ')}`);
        if (p.sizes?.length)  lines.push(`📏 المقاسات: ${p.sizes.join(', ')}`);
        if (p.description)    lines.push(`📝 الوصف: ${p.description}`);
        lines.push(`✅ المخزون: ${p.stock > 0 ? 'متوفر' : 'غير متوفر حالياً'}`);
        return lines.join('\n');
    }).join('\n\n');
}

module.exports = {
    findRelevantProducts,
    checkSizeAvailability,
    checkDeliveryAvailability,
    formatProductContext
};
