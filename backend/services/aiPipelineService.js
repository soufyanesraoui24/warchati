const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const TemplateResponse = require('../models/TemplateResponse');
const Product = require('../models/Product');
const BotSettings = require('../models/BotSettings');
const { generateGroqResponse } = require('./groqAIService');
const { analyzeMessage, getEmotionResponse } = require('./messageAnalyzer');
const { getIO } = require('../config/socket');

const responseCache = new Map();
const CACHE_TTL = 3600000;

function getCached(text) {
    const key = text.trim().slice(0, 100).toLowerCase();
    const entry = responseCache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.text;
    return null;
}

function setCached(text, reply) {
    const key = text.trim().slice(0, 100).toLowerCase();
    responseCache.set(key, { text: reply, ts: Date.now() });
}

const LANG_PROMPTS = {
    darija: 'ردّي بالدارجة الجزائرية. استخدمي كلمات محلية مثل "شنو"، "واش"، "بقداه"، "درك".',
    fossha: 'ردّي باللغة العربية الفصحى البسيطة.',
    mixed: 'ردّي بمزيج من الدارجة الجزائرية والعربية الفصحى.'
};

function trimResponse(text) {
    if (!text) return '';
    let clean = text.replace(/[*#\-_`]/g, '');
    let sentences = clean.split(/[.!\n]/).filter(Boolean);
    const first = sentences[0] || clean;
    const words = first.split(/\s+/).filter(Boolean);
    return words.slice(0, 20).join(' ');
}

async function getProductContext(keywords) {
    if (!keywords || keywords.length === 0) return '';
    try {
        const regexPattern = keywords.join('|');
        const products = await Product.find({
            $or: [
                { name: { $regex: regexPattern, $options: 'i' } },
                { description: { $regex: regexPattern, $options: 'i' } },
                { category: { $regex: regexPattern, $options: 'i' } }
            ]
        }).limit(5).lean();
        if (!products || products.length === 0) return '';
        return products.map(p => {
            const info = [`المنتج: ${p.name}، السعر: ${p.price} دج`];
            if (p.colors?.length) info.push(`الألوان: ${p.colors.join('، ')}`);
            if (p.sizes?.length) info.push(`المقاسات: ${p.sizes.join('، ')}`);
            info.push(`المخزون: ${p.stock > 0 ? 'متوفر' : 'غير متوفر'}`);
            return info.join(' | ');
        }).join('\n');
    } catch (error) {
        return '';
    }
}

async function getAllProductsContext() {
    try {
        const products = await Product.find({ isActive: true }).limit(10).lean();
        if (!products || products.length === 0) return '';
        return products.map(p =>
            `${p.name}: ${p.price} دج${p.stock > 0 ? ' (متوفر)' : ' (غير متوفر)'}`
        ).join(' | ');
    } catch {
        return '';
    }
}

async function getConversationHistory(conversationId, limit = 3) {
    try {
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return messages.reverse().map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));
    } catch {
        return [];
    }
}

function containsArabic(str) {
    return /[\u0600-\u06FF]/.test(str);
}

function isValidResponse(text) {
    if (!text || text.length < 5) return false;
    const bad = ['تعذر', 'غير متاح', 'حدث خطأ', 'مشكلة تقنية', 'آسف لا أستطيع'];
    for (const w of bad) {
        if (text.includes(w)) return false;
    }
    if (!containsArabic(text)) return false;
    return true;
}

const INTENT_MAP = {
    price_inquiry:      ['سعر', 'ثمن', 'prix'],
    delivery_inquiry:   ['توصيل', 'ولاية', 'ديليفري', 'livraison'],
    size_inquiry:       ['مقاس', 'قياس', 'طاي', 'taille'],
    color_inquiry:      ['لون', 'ألوان', 'couleur'],
    availability_inquiry: ['متوفر', 'موجود', 'كاين', 'stock', 'ستوك'],
    product_inquiry:    ['منتج', 'منتوج', 'سلعة', 'نوع'],
    greeting:           ['سلام', 'ترحيب', 'مرحبا', 'bonjour'],
    complaint:          ['مشكل', 'شكوى', 'غضب', 'probleme'],
    order_status:       ['طلب', 'طلبية', 'commande', 'suivi'],
    payment_inquiry:    ['دفع', 'paiement', 'كارت', 'ccp'],
    discount_inquiry:   ['تخفيض', 'عرض', 'خصم', 'promo'],
    working_hours:      ['ساعة', 'وقت', 'يفتح', 'يقفل'],
    store_info:         ['عنوان', 'موقع', 'مقر', 'adresse'],
    return_policy:      ['إرجاع', 'تبديل', 'استرجاع', 'retour'],
    perfume_inquiry:    ['عطر', 'parfum'],
    shoe_inquiry:       ['حذاء', 'أحذية', 'سنيكرز', 'صندل'],
    how_to_order:       ['طلب', 'كيفاش', 'شراء', 'طريقة', 'تحميل'],
};

let cachedTemplates = null;
let lastTemplateFetch = 0;
const TEMPLATE_CACHE_TTL = 60000;

async function getTemplates() {
    const now = Date.now();
    if (cachedTemplates && (now - lastTemplateFetch) < TEMPLATE_CACHE_TTL) {
        return cachedTemplates;
    }
    cachedTemplates = await TemplateResponse.find({ isActive: true }).lean();
    lastTemplateFetch = Date.now();
    return cachedTemplates;
}

async function searchTemplates(messageText, detectedIntent, keywords) {
    try {
        const allTemplates = await getTemplates();
        if (!allTemplates.length) {
            console.log('[Templates] No active templates found');
            return null;
        }

        let bestTemplate = null;
        let bestScore = 0;

        for (const tpl of allTemplates) {
            let score = 0;

            if (tpl.intent && detectedIntent) {
                const mapKw = INTENT_MAP[detectedIntent] || [detectedIntent];
                const tplI = tpl.intent.toLowerCase().trim();
                if (mapKw.some(kw => tplI.includes(kw))) {
                    score += 2;
                }
            }

            const userWords = messageText.split(/\s+/).filter(w => w.length > 2);
            if (userWords.length > 0 && tpl.questions?.length) {
                for (const question of tpl.questions) {
                    const qWords = question.split(/\s+/).filter(w => w.length > 2);
                    const matches = userWords.filter(w =>
                        qWords.some(qw => qw.includes(w) || w.includes(qw))
                    );
                    const qScore = userWords.length > 0
                        ? (matches.length / userWords.length) * 2
                        : 0;
                    if (qScore > score) score = qScore;
                }
            }

            if (keywords?.length && tpl.questions?.length) {
                for (const kw of keywords) {
                    for (const q of tpl.questions) {
                        if (q.includes(kw)) { score += 1; break; }
                    }
                }
            }

            console.log(`[Templates] "${tpl.intent}" score=${score}`);
            if (score > bestScore) {
                bestScore = score;
                bestTemplate = tpl;
            }
        }

        console.log(`[Templates] Best: "${bestTemplate?.intent}" score=${bestScore} threshold=0.5`);
        if (bestTemplate && bestScore >= 0.5) {
            console.log(`[Pipeline] Template matched: "${bestTemplate.text.substring(0, 60)}..."`);
            return bestTemplate.text;
        }
        console.log('[Templates] No template matched, falling through');
        return null;
    } catch (err) {
        console.log('[Templates] Error:', err.message);
        return null;
    }
}

exports.processMessage = async (messageText, conversationId) => {
    const cleanedText = messageText.trim();
    console.log(`[Pipeline] Incoming: "${cleanedText}"`);

    let settings = null;
    try { settings = await BotSettings.findOne(); } catch {}
    const botName = settings?.botName || 'وردة';
    const langStyle = settings?.languageStyle || 'darija';
    const fallbackMsg = settings?.fallbackMessage || 'عفواً، ما فهمتش الرسالة. تقدر تعيد صياغتها؟';
    const welcomeMsg = settings?.welcomeMessage || `مرحبا بيك في ${botName} 🌸 كيف نقدر نعاونك؟`;
    const langInstruction = LANG_PROMPTS[langStyle] || LANG_PROMPTS.darija;

    let conversation;
    try {
        conversation = await Conversation.findById(conversationId);
        if (!conversation) return { text: null, intent: null, sentiment: null, skipped: true };
    } catch {
        return { text: null, intent: null, sentiment: null, skipped: true };
    }

    if (conversation.status === 'HANDOFF' || conversation.status === 'CLOSED') {
        console.log('[Pipeline] Conversation is HANDOFF/CLOSED - skipping');
        return { text: null, intent: null, sentiment: null, skipped: true };
    }

    if (conversation.aiActive === false) {
        console.log('[Pipeline] AI paused - skipping');
        return { text: null, intent: null, sentiment: null, skipped: true };
    }

    const analysis = analyzeMessage(cleanedText);
    const { intent, sentiment, emotion, emotionScore, emotions, needsHandoff, keywords } = analysis;

    // ═══════════════════════════════════════════════
    // EMOTION-BASED HANDOFF (anger, strong frustration, sarcasm)
    // ═══════════════════════════════════════════════
    if (needsHandoff) {
        console.log(`[Emotion] Handoff triggered by "${emotion}" (score: ${emotionScore})`);
        await Conversation.findByIdAndUpdate(conversationId, { status: 'HANDOFF' });
        const io = getIO();
        if (io) {
            io.to('monitor_room').emit('handoff_alert', { conversationId, intent, sentiment, emotion });
        }
        return {
            text: getEmotionResponse(emotion),
            intent, sentiment, emotion, emotionScore, emotions, needsHandoff: true
        };
    }

    if (sentiment === 'negative') {
        console.log('[Emotion] Negative sentiment without handoff trigger');
    }

    const emotionPrefix = getEmotionResponse(emotion);

    // ═══════════════════════════════════════════════
    // WELCOME + GREETING
    // ═══════════════════════════════════════════════
    let responseText = '';
    let isFirstMessage = false;
    if (!conversation.welcomeSent) {
        responseText = welcomeMsg;
        isFirstMessage = true;
        await Conversation.findByIdAndUpdate(conversationId, { welcomeSent: true });
    }

    if (isFirstMessage && intent === 'greeting') {
        return { text: responseText, intent, sentiment, emotion, emotionScore, emotions };
    }

    // ═══════════════════════════════════════════════
    // TEMPLATE MATCHING
    // ═══════════════════════════════════════════════
    const templateText = await searchTemplates(cleanedText, intent, keywords);
    if (templateText) {
        let finalText = responseText ? `${responseText}\n\n${templateText}` : templateText;
        if (emotionPrefix) finalText = `${emotionPrefix}\n\n${finalText}`;
        return { text: finalText, intent: templateText.includes('السعر') ? 'price_inquiry' : intent, sentiment, emotion, emotionScore, emotions };
    }

    // ═══════════════════════════════════════════════
    // RESPONSE CACHE
    // ═══════════════════════════════════════════════
    const cached = getCached(cleanedText);
    if (cached) {
        console.log('[Pipeline] Cache hit');
        let finalText = responseText ? `${responseText}\n\n${cached}` : cached;
        if (emotionPrefix) finalText = `${emotionPrefix}\n\n${finalText}`;
        return { text: finalText, intent, sentiment, emotion, emotionScore, emotions };
    }

    // ═══════════════════════════════════════════════
    // GROQ AI RESPONSE
    // ═══════════════════════════════════════════════
    const productCtx = await getProductContext(keywords);
    const history = await getConversationHistory(conversationId);

    const systemPrompt = `You are "${botName}", a helpful Algerian store assistant.
${langInstruction}
- Reply in 1-2 short sentences.
- Be direct and helpful.
- Customer emotion: ${emotion} (${(emotionScore * 100).toFixed(0)}%)`;

    const userContent = `سؤال: ${cleanedText}
نية: ${intent}
${productCtx || ''}`;

    const aiMessages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userContent }
    ];

    console.log('[Pipeline] Sending to Groq...');
    const rawResponse = await generateGroqResponse(aiMessages);

    if (rawResponse && rawResponse.length > 5) {
        const aiText = trimResponse(rawResponse);
        console.log(`[Pipeline] AI reply: "${aiText.substring(0, 60)}..."`);

        if (isValidResponse(aiText)) {
            let finalText = responseText ? `${responseText}\n\n${aiText}` : aiText;
            if (emotionPrefix) finalText = `${emotionPrefix}\n\n${finalText}`;
            setCached(cleanedText, aiText);
            const io = getIO();
            if (io) {
                io.to('monitor_room').emit('new_ai_response', {
                    conversationId, intent, sentiment, emotion, aiResponse: aiText
                });
            }
            return { text: finalText, intent, sentiment, emotion, emotionScore, emotions };
        }
        console.log('[Pipeline] AI response invalid - handing off');
    }

    if (isFirstMessage) {
        await Conversation.findByIdAndUpdate(conversationId, { status: 'HANDOFF' });
        const io = getIO();
        if (io) {
            io.to('monitor_room').emit('handoff_alert', { conversationId, intent, sentiment, emotion });
        }
        return {
            text: `${responseText}\n\nنعتذر منك، راح نحولك للموظف باش يساعدك أكثر.`,
            intent, sentiment, emotion, emotionScore, emotions, needsHandoff: true
        };
    }

    const fallback = emotionPrefix ? `${emotionPrefix}\n\n${fallbackMsg}` : fallbackMsg;
    return { text: fallback, intent: intent || 'unknown', sentiment, emotion, emotionScore, emotions };
};
