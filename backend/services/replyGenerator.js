/**
 * replyGenerator.js
 * توليد الرد النهائي للزبون بناءً على التحليل وسياق المنتجات والقوالب
 * المصادر: template → ai → fallback
 */

const TemplateResponse = require('../models/TemplateResponse');
const { generateGroqResponse } = require('./groqAIService');

// ─── نظام الشخصية لـ "وردة" عند توليد الرد عبر AI ──────────────────────────
const WARDA_SYSTEM_PROMPT = `أنت "وردة"، مساعدة مبيعات ذكية ومحترفة لمتجر إلكتروني جزائري.

قواعد الحديث (مهمة جداً):
1. تحدثي دائماً بـ"الدارجة الجزائرية العاصمية" الواضحة والمفهومة (بحروف عربية).
2. أسلوبك ودود، ترحيبي، ومقنع (Sales-driven).
3. ردودك قصيرة (3 إلى 5 جمل فقط) وتنتهي دائماً بدعوة للشراء (Call to Action).
4. لا تخترعي أسعاراً أو معلومات منتجات من خيالك. استعملي فقط المعلومات المعطاة لك.
5. إذا لم تجدي المنتج في المعلومات المعطاة، قولي: "ضرك نشوف معك هاد المنتوج، واش تخليني نراسلك؟"
6. التوصيل متوفر لـ 58 ولاية والدفع عند الاستلام دائماً.
7. استعملي رموز تعبيرية (emoji) باعتدال لإضفاء طابع ودود.`;

// ─── ردود احتياطية (Fallback) حسب النية ─────────────────────────────────────

const FALLBACK_REPLIES = {
    greeting:            'مرحبا بك في وردة 🌸 آش نجم نخدمك؟',
    price_inquiry:       'سمحلي خويا، عندي معلوماتش على السعر درك. تحب نراسل واحد من الفريق باش يعاودك؟',
    delivery_inquiry:    'التوصيل متوفر لـ 58 ولاية والدفع عند الاستلام دايماً ✅ تحب تعرف أكثر على ولايتك؟',
    size_inquiry:        'عندنا مقاسات متنوعة 🔍 تقدر تجرب وتشوف شنو المناسب لك.',
    color_inquiry:       'عندنا بزاف ألوان 🌈 تحب نوريوك اللي متوفرين؟',
    order_status:        'طلبك تحت المراقبة 👀 تحب نعاود نتحقق من حالتو؟',
    complaint:           'سمحلي على هاد المشكل 🙏 نحمله لمسؤول باش يعاودلك.',
    availability_inquiry:'المخزون يتجدد باستمرار 📦 تحب نتفقد منتوج معين؟',
    payment_inquiry:     'الدفع عند الاستلام 💳 هو الطريقة المتاحة عندنا.',
    product_inquiry:     'عندنا تشكيلة كبيرة من المنتوجات 🛍️ شكون اللي حاب تشوف؟',
    general:             'آش نجم نخدمك بهداك؟ 😊 نحاول نجاوبك بسرعة.'
};

// ─── الدالة الرئيسية ────────────────────────────────────────────────────────

/**
 * توليد الرد النهائي بناءً على تحليل الرسالة وسياق المنتجات
 * @param {object} analysis - نتيجة التحليل { intent, sentiment, keywords }
 * @param {string} productContext - سياق المنتجات المنسق
 * @param {object} conversation - معلومات المحادثة { conversationId, platform, senderId }
 * @returns {Promise<{text: string, source: string}>}
 */
async function generateReply(analysis, productContext, conversation) {
    const { intent, sentiment, keywords } = analysis;

    // ── 1. البحث عن قالب جاهز في قاعدة البيانات ──
    try {
        const template = await TemplateResponse.findOne({ intent, isActive: true }).lean();
        if (template) {
            return { text: template.text, source: 'template' };
        }
    } catch (error) {
        console.error('[ReplyGenerator] Error fetching template:', error.message);
    }

    // ── 2. توليد الرد عبر Groq AI ──
    try {
        const messages = [
            { role: 'system', content: WARDA_SYSTEM_PROMPT },
            {
                role: 'user',
                content: [
                    `نية الزبون: ${intent}`,
                    `مشاعر الزبون: ${sentiment}`,
                    `الكلمات المفتاحية: ${keywords.join(', ') || 'لا توجد'}`,
                    `رسالة الزبون: ${conversation.lastMessage || ''}`,
                    '',
                    '[معلومات المنتجات من المخزون]:',
                    productContext || 'لا توجد معلومات منتجات متاحة.'
                ].join('\n')
            }
        ];

        const aiText = await generateGroqResponse(messages);
        if (aiText && aiText.length > 10) {
            return { text: aiText, source: 'ai' };
        }
    } catch (error) {
        console.error('[ReplyGenerator] Error generating AI reply:', error.message);
    }

    // ── 3. رد احتياطي (Fallback) حسب النية ──
    const fallbackText = FALLBACK_REPLIES[intent] || FALLBACK_REPLIES.general;
    return { text: fallbackText, source: 'fallback' };
}

module.exports = { generateReply };
