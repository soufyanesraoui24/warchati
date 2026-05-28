/**
 * messageAnalyzer.js
 * تحليل رسائل الزبائن (Intent, Sentiment, Keywords) بدون OpenAI
 * يعتمد على قواعد كلمات مفتاحية - قابل للاستبدال بنموذج تصنيف محلي لاحقاً
 */

// ─── قواعد تحليل النية (Intent) ──────────────────────────────────────────────

const INTENT_RULES = [
    {
        intent: 'price_inquiry',
        keywords: [
            'شحال', 'بقداه', 'السعر', 'سومة', 'غالي', 'رخيص',
            'بكم', 'فلوس', 'دراهم', 'دج', 'ثمن', 'prix', 'combien'
        ]
    },
    {
        intent: 'delivery_inquiry',
        keywords: [
            'توصيل', 'توصلو', 'توصيلة', 'لوسون', 'الأجل', 'متى تجي',
            'وقتاش', 'ولاية', 'عنابة', 'وهران', 'قسنطينة', 'الجزائر',
            'باتنة', 'سطيف', 'تيزي', 'bejaia', 'livraison', 'باسكو'
        ]
    },
    {
        intent: 'size_inquiry',
        keywords: [
            'مقاس', 'قياس', 'مقاسات', 'xl', 'xxl', 'l', 'm', 's',
            'كبير', 'صغير', 'وسط', 'taille', 'pointure'
        ]
    },
    {
        intent: 'color_inquiry',
        keywords: [
            'لون', 'ألوان', 'أحمر', 'أزرق', 'أخضر', 'أصفر', 'أبيض',
            'أسود', 'بترولي', 'بيج', 'رمادي', 'بني', 'وردي', 'نيلي',
            'couleur', 'rouge', 'bleu', 'noir', 'blanc'
        ]
    },
    {
        intent: 'order_status',
        keywords: [
            'طلب', 'طلبية', 'ما وصلنيش', 'وين طلبي', 'متى يجي',
            'كم يوم', 'رقم التتبع', 'ويلدالي', 'commande', 'suivi'
        ]
    },
    {
        intent: 'complaint',
        keywords: [
            'مشكل', 'معطوب', 'مكسور', 'ماشي مليح', 'ما عجبنيش',
            'راجعو', 'نرجع', 'استرجاع', 'مشكلة', 'كلاهم', 'غش',
            'retour', 'remboursement', 'problème'
        ]
    },
    {
        intent: 'availability_inquiry',
        keywords: [
            'كاين', 'متوفر', 'موجود', 'ماكاينش', 'خلاص', 'راكد',
            'ستوك', 'disponible', 'stock'
        ]
    },
    {
        intent: 'greeting',
        keywords: [
            'سلام', 'صباح', 'مساء', 'آش راك', 'لاباس', 'بونجور',
            'بسلامة', 'مرحبا', 'هلا', 'bonjour', 'salam', 'بخير'
        ]
    },
    {
        intent: 'payment_inquiry',
        keywords: [
            'دفع', 'دفع عند الاستلام', 'كارت', 'CCP', 'بريد',
            'paiement', 'livraison', 'الدفع', 'تسديد'
        ]
    },
    {
        intent: 'product_inquiry',
        keywords: [
            'قميص', 'بلوزة', 'تيشورت', 'سروال', 'جاكيت', 'بنطلون',
            'صباط', 'كشمير', 'شال', 'حزام', 'حقيبة', 'كاب', 'عطر',
            'منتوج', 'سلعة', 'صورة', 'كيما', 'هدرة عنو'
        ]
    }
];

// ─── قواعد تحليل المشاعر (Sentiment) ─────────────────────────────────────────

const NEGATIVE_KEYWORDS = [
    'غاضب', 'غضبان', 'عييت', 'ما وصلنيش', 'نهبتوني', 'غاشين',
    'حرام', 'واعر', 'قرف', 'نحقد', 'زفت', 'خايب', 'احتيال',
    'كذابين', 'ما رجعتولي', 'ضيعت فلوسي', 'مزعج', 'ما كاينش',
    'نخسر', 'فضيحة', 'خطأ', 'meskina', 'tricher', 'arnaque'
];

const POSITIVE_KEYWORDS = [
    'شكرا', 'برك الله', 'مليح', 'زوين', 'عجبني', 'راضي', 'برافو',
    'ممتاز', 'شكراً', 'واو', 'سوبر', 'بهي', 'عظيم', 'جيد',
    'merci', 'super', 'parfait', 'excellent'
];

// ─── قاموس المنتجات لاستخراج الكلمات المفتاحية ────────────────────────────────

const PRODUCT_KEYWORDS = [
    'قميص', 'بلوزة', 'تيشورت', 'سروال', 'بنطلون', 'جاكيت', 'كشمير',
    'صباط', 'حذاء', 'شال', 'حقيبة', 'كاب', 'عطر', 'ساعة', 'نظارة',
    'حزام', 'كنزة', 'رداء', 'فستان', 'بدلة', 'سترة', 'شورت'
];

// ─── الدالة الرئيسية للتحليل ──────────────────────────────────────────────────

/**
 * تحليل رسالة الزبون واستخراج النية والمشاعر والكلمات المفتاحية
 * @param {string} message - نص رسالة الزبون
 * @returns {{ intent: string, sentiment: string, keywords: string[] }}
 */
function analyzeMessage(message) {
    const lower = message.toLowerCase().trim();

    // ── 1. تحليل المشاعر ──
    let sentiment = 'neutral';
    const hasNegative = NEGATIVE_KEYWORDS.some(kw => lower.includes(kw));
    const hasPositive = POSITIVE_KEYWORDS.some(kw => lower.includes(kw));

    if (hasNegative) {
        sentiment = 'negative';
    } else if (hasPositive) {
        sentiment = 'positive';
    }

    // ── 2. تحليل النية (أول مطابقة تفوز) ──
    let intent = 'general';
    let maxMatches = 0;

    for (const rule of INTENT_RULES) {
        const matches = rule.keywords.filter(kw => lower.includes(kw)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            intent = rule.intent;
        }
    }

    // ── 3. استخراج الكلمات المفتاحية (أسماء المنتجات) ──
    const keywords = PRODUCT_KEYWORDS.filter(kw => lower.includes(kw));

    return { intent, sentiment, keywords };
}

module.exports = { analyzeMessage };
