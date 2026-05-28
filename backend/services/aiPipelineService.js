/**
 * aiPipelineService.js  (v2 - Local AI Edition)
 * ─────────────────────────────────────────────
 * تم حذف OpenAI بالكامل.
 * النظام يعمل الآن محلياً عبر:
 *   - Ollama (localAIService.js)     → توليد الردود
 *   - messageAnalyzer.js             → تحليل النية والمشاعر
 *   - MongoDB                        → جلب المنتجات الحقيقية + التاريخ
 *   - TemplateResponse               → ردود جاهزة للنوايا الشائعة
 */

const Conversation      = require('../models/Conversation');
const Message           = require('../models/Message');
const TemplateResponse  = require('../models/TemplateResponse');
const Product           = require('../models/Product');

const { generateLocalResponse } = require('./localAIService');
const { analyzeMessage }        = require('./messageAnalyzer');

// ─── Socket.IO للإشعارات الفورية ──────────────────────────────────────────────
const { getIO } = require('../config/socket');

// ─── شخصية وردة (System Prompt) ──────────────────────────────────────────────
const WARDA_SYSTEM_PROMPT = `أنت "وردة"، مساعدة مبيعات لمتجر جزائري.

تعليمات صارمة:
- ردّي بجملة أو جملتين فقط بالدارجة الجزائرية
- لا تتعدى 20 كلمة أبداً
- لا تستخدمي الفصحى
- لا تستخدمي تنسيق Markdown (لا *, لا -, لا #)
- كوني مباشرة ومفيدة
- اختمي بسؤال للزبون`;

// ─── تقليم الردود الطويلة ────────────────────────────────────────────────────

function trimResponse(text) {
    if (!text) return '';
    // إزالة أي تنسيق Markdown
    let clean = text.replace(/[*#\-_`]/g, '');
    // أخذ أول 25 كلمة فقط
    const words = clean.split(/\s+/).filter(Boolean);
    return words.slice(0, 25).join(' ');
}

// ─── جلب سياق المنتجات من MongoDB ────────────────────────────────────────────

/**
 * يبحث في قاعدة البيانات عن منتجات مرتبطة بالكلمات المفتاحية
 * @param {string[]} keywords
 * @returns {Promise<string>}
 */
async function getProductContext(keywords) {
    if (!keywords || keywords.length === 0) {
        return 'لا توجد كلمات مفتاحية للبحث. يرجى ذكر اسم المنتج.';
    }

    try {
        // محاولة تحميل نموذج Product إن وُجد
        let Product;
        try {
            Product = require('../models/Product');
        } catch {
            // نموذج Product غير موجود بعد - نرجع سياقاً افتراضياً
            return `متجر وردة يوفر تشكيلة واسعة من الملابس والإكسسوارات. التوصيل لـ 58 ولاية. الدفع عند الاستلام.`;
        }

        const regexPattern = keywords.join('|');
        const products = await Product.find({
            $or: [
                { name:        { $regex: regexPattern, $options: 'i' } },
                { description: { $regex: regexPattern, $options: 'i' } },
                { category:    { $regex: regexPattern, $options: 'i' } }
            ]
        }).limit(5).lean();

        if (!products || products.length === 0) {
            return `لم نجد منتجاً بـ "${keywords.join(', ')}" في المخزون حالياً.`;
        }

        return products.map(p => {
            const lines = [`📦 المنتج: ${p.name}`];
            if (p.price)       lines.push(`💰 السعر: ${p.price} دج`);
            if (p.colors?.length)  lines.push(`🎨 الألوان: ${p.colors.join(', ')}`);
            if (p.sizes?.length)   lines.push(`📏 المقاسات: ${p.sizes.join(', ')}`);
            if (p.description) lines.push(`📝 الوصف: ${p.description}`);
            lines.push(`✅ المخزون: ${p.stock > 0 ? 'متوفر' : 'غير متوفر'}`);
            return lines.join('\n');
        }).join('\n\n');

    } catch (error) {
        console.error('[Pipeline] Error fetching products:', error.message);
        return 'تعذر جلب معلومات المنتجات من قاعدة البيانات.';
    }
}

// ─── جلب تاريخ المحادثة ───────────────────────────────────────────────────────

/**
 * يجلب آخر N رسائل من المحادثة لإضافتها للسياق
 * @param {string} conversationId
 * @param {number} limit
 * @returns {Promise<Array<{role: string, content: string}>>}
 */
async function getConversationHistory(conversationId, limit = 6) {
    try {
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return messages.reverse().map(msg => ({
            role:    msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));
    } catch (error) {
        console.error('[Pipeline] Error fetching conversation history:', error.message);
        return [];
    }
}

// ─── الدالة الرئيسية: معالجة رسالة الزبون ────────────────────────────────────

/**
 * يعالج رسالة الزبون ويولّد رداً ذكياً محلياً
 * @param {string} messageText
 * @param {string} conversationId
 * @returns {Promise<{text: string, intent: string, sentiment: string}>}
 */
exports.processMessage = async (messageText, conversationId) => {
    console.log(`[Pipeline] 📩 Incoming message: "${messageText}"`);

    const cleanedText = messageText.trim();

    // ── 0. تحقق من تفعيل AI لهذه المحادثة ──
    let conversation;
    try {
        conversation = await Conversation.findById(conversationId).lean();
        if (!conversation || conversation.aiActive === false) {
            console.log(`[Pipeline] ⏸️ AI paused for conversation ${conversationId} - no reply will be generated`);
            return { text: null, intent: null, sentiment: null, skipped: true };
        }
    } catch (error) {
        console.error('[Pipeline] Error checking AI state:', error.message);
    }

    // ── 0.5. أول رسالة → عرض المنتجات المتوفرة ──
    try {
        const msgCount = await Message.countDocuments({ conversationId });
        if (msgCount <= 1 && conversation) {
            const products = await Product.find({ isActive: true }).limit(5).lean();
            if (products.length > 0) {
                const offerLines = products.map(p => `${p.name}: ${p.price} دج`).join(' | ');
                const productImages = products.flatMap(p => p.images || []);
                const welcomeText = `مرحبا بيك في وردة 🌸 عندنا هاذ المنتجات: ${offerLines}. تحب تسأل على حاجة معينة؟`;
                console.log(`[Pipeline] 🎉 First message → showing products`);
                const io = getIO();
                if (io) {
                    io.to('monitor_room').emit('new_ai_response', {
                        conversationId,
                        customerMessage: cleanedText,
                        aiResponse: welcomeText,
                        intent: 'greeting',
                        sentiment: 'positive',
                        images: productImages.slice(0, 5),
                        timestamp: new Date().toISOString()
                    });
                }
                return { text: welcomeText, intent: 'greeting', sentiment: 'positive', images: productImages.slice(0, 5) };
            }
        }
    } catch (error) {
        console.error('[Pipeline] Error in first-message offer check:', error.message);
    }

    // ── 1. تحليل الرسالة (Intent, Sentiment, Keywords) محلياً ──
    const { intent, sentiment, keywords } = analyzeMessage(cleanedText);
    console.log(`[Pipeline] 🔍 Analysis → intent: ${intent} | sentiment: ${sentiment} | keywords: [${keywords.join(', ')}]`);

    // ── 2. تفعيل نظام التحويل (Handoff) إذا كان الزبون غاضباً ──
    if (sentiment === 'negative') {
        await Conversation.findByIdAndUpdate(conversationId, { status: 'HANDOFF' });
        console.log('[Pipeline] 🚨 HANDOFF activated due to negative sentiment.');

        // ── إرسال إشعار فوري للموظفين عبر Socket.IO ──
        const io = getIO();
        if (io) {
            io.to('monitor_room').emit('handoff_alert', {
                conversationId,
                customerMessage: cleanedText,
                intent,
                sentiment,
                timestamp: new Date().toISOString()
            });
            console.log('[Pipeline] 📡 Handoff notification sent via Socket.IO');
        }

        return {
            text:      'سمحلي بزاف على الإزعاج 🙏 راح نحوّل المحادثة لموظف باش يعاونك مباشرة ويحل معك أي مشكلة.',
            intent,
            sentiment
        };
    }

    // ── 3. البحث عن قوالب خاصة بالمنتج (Question Matching) ──
    if (keywords.length > 0) {
        try {
            const matchedProducts = await Product.find({
                $or: [
                    { name: { $regex: keywords.join('|'), $options: 'i' } },
                    { category: { $regex: keywords.join('|'), $options: 'i' } }
                ]
            }).limit(3).lean();

            if (matchedProducts.length > 0) {
                const productIds = matchedProducts.map(p => p._id);
                const messageWords = cleanedText.split(/\s+/).filter(w => w.length > 2);

                // البحث عن قالب يحتوي على سؤال يطابق كلمات الرسالة
                const productTemplate = await TemplateResponse.findOne({
                    productId: { $in: productIds },
                    questions: { $elemMatch: { $regex: messageWords.join('|'), $options: 'i' } },
                    isActive: true
                }).lean();

                if (productTemplate) {
                    console.log(`[Pipeline] 📋 Product template matched for: ${matchedProducts[0].name}`);
                    return { text: productTemplate.text, intent, sentiment };
                }
            }
        } catch (error) {
            console.error('[Pipeline] Error matching product templates:', error.message);
        }
    }

    // ── 4. البحث عن قوالب عامة في قاعدة البيانات ──
    try {
        const messageWords = cleanedText.split(/\s+/).filter(w => w.length > 2);
        const template = await TemplateResponse.findOne({
            productId: null,
            isActive: true,
            questions: { $elemMatch: { $regex: messageWords.join('|'), $options: 'i' } }
        }).lean();
        if (template) {
            console.log(`[Pipeline] 📋 General template matched`);
            return { text: template.text, intent, sentiment };
        }
    } catch (error) {
        console.error('[Pipeline] Error fetching general templates:', error.message);
    }

    // ── 5. ردود القوالب الجاهزة للأسئلة الشائعة (بدون Ollama) ──
    const DEFAULT_TEMPLATES = {
        greeting: 'وعليكم السلام ورحمة الله وبركاته 😊 كيف نقدر نعاونك اليوم؟ واش تحب تشوف من المنتجات؟',
        price_inquiry: 'السعر يختلف على حساب المنتج. واش تحدد المنتج اللي حاب تشوف سعره؟ عندنا تشكيلة متنوعة.',
        delivery_inquiry: 'نعم التوصيل متوفر لجميع ولايات الجزائر ✅ والدفع عند الاستلام. كم يوم تحب نوصلو؟',
        size_inquiry: 'المقاسات متوفرة من 52 حتى 58. واش المقاس اللي حاب تعاين عليه بالضبط؟',
        color_inquiry: 'عندنا تشكيلة ألوان متنوعة 🎨 على حساب المنتج. واش لون اللي تحب تشوف؟',
        availability_inquiry: 'المنتج متوفر حالياً ✅ تقدر تطلبيه الآن والتوصيل لجميع الولايات.',
        payment_inquiry: 'الدفع عند الاستلام ✅ وصل المنتج عند باب دارك وخلصت. آمن ومضمون.',
        order_status: 'ضرك نتحقق من طلبك ونرجعلك خبر. شكراً على صبرك 🙏',
        complaint: 'نعتذر منك بزاف على هاد المشكل 🙏 ضرك نحوّلك لموظف باش يعاونك مباشرة.',
        product_inquiry: 'عندنا تشكيلة واسعة من المنتجات. واش تحب تعاين بالضبط؟ نعاونك في البحث.',
        wholesale_inquiry: 'نعم البيع بالجملة متوفر 📦 أقل كمية 12 قطعة. تحب تعرف الأسعار بالتفصيل؟',
        thanks: 'العفو 🙏 هذا واجبنا. في خدمتك أي وقت تحب.',
        follow_up: 'نعم خويا 😊 واش تحب تسأل أكثر؟',
        general: 'نقدر نعاونك بواش تحب 😊 واش تطلب من المنتجات اللي عندنا؟',
        unknown: 'سمحلي ما فهمتش مليح 😅 تقدر توضّح أكثر؟ واش تحب بالضبط؟'
    };

    if (DEFAULT_TEMPLATES[intent]) {
        console.log(`[Pipeline] 📋 Default template reply for intent: ${intent}`);
        return { text: DEFAULT_TEMPLATES[intent], intent, sentiment };
    }

    // ── 6. جلب سياق المنتجات من MongoDB ──
    const productContext = await getProductContext(keywords);
    console.log(`[Pipeline] 🛒 Product context ready (${productContext.length} chars)`);

    // ── 7. جلب تاريخ المحادثة ──
    const conversationHistory = await getConversationHistory(conversationId);

    // ── 6. بناء قائمة الرسائل لإرسالها لـ Ollama ──
    const messages = [
        { role: 'system', content: WARDA_SYSTEM_PROMPT },
        ...conversationHistory,
        {
            role: 'user',
            content: `رسالة الزبون: ${cleanedText}\n\n[معلومات المنتجات من المخزون]:\n${productContext}`
        }
    ];

    // ── 7. توليد الرد عبر النموذج المحلي (Ollama) ──
    console.log('[Pipeline] 🤖 Sending request to Ollama...');
    const rawResponse = await generateLocalResponse(messages);
    const aiResponseText = trimResponse(rawResponse);
    console.log(`[Pipeline] ✅ Reply: "${aiResponseText.substring(0, 80)}..."`);

    // ── 8. بث الرد للمراقبة الحية عبر Socket.IO ──
    const io = getIO();
    if (io) {
        io.to('monitor_room').emit('new_ai_response', {
            conversationId,
            customerMessage: cleanedText,
            aiResponse: aiResponseText,
            intent,
            sentiment,
            timestamp: new Date().toISOString()
        });
    }

    return { text: aiResponseText, intent, sentiment };
};
