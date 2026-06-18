const EMOTION_RULES = [
    {
        emotion: 'anger',
        weight: 1.0,
        triggers_handoff: true,
        keywords: [
            'غضب', 'غضبان', 'غاضب', 'مغضوب', 'حرام', 'حرام عليكم',
            'احتيال', 'غشاشين', 'نصابين', 'كذابين', 'دجالين',
            'نهبتوني', 'ضيعت', 'سرقت', 'ما رجعتولي', 'حقى', 'حقي',
            'فضيحة', 'عار', 'قرف', 'زبالة', 'خايب', 'خايبة', 'زفت',
            'تريقه', 'تخسروا', 'تخسر', 'نخسر', 'خسارة',
            'تسخيف', 'تسحيل', 'مش معقول', 'هضرة', 'واضحة', 'ديما',
            'طفح', 'طفح الكيل', 'ما نتحملش', 'نقرف', 'تخسروا دينكم',
            'عداوة', 'تبهديل', 'تبهدلت', 'فضحتوني', 'عيب', 'عار عليكم'
        ]
    },
    {
        emotion: 'frustration',
        weight: 0.8,
        triggers_handoff: true,
        keywords: [
            'عييت', 'زهقان', 'زهقت', 'زهق', 'ما عجبنيش', 'ماشي مليح',
            'ما فهمتونيش', 'كلاهم', 'مزعج', 'مزعجة', 'تأخر', 'تأخير',
            'طول', 'طويل', 'بزاف', 'هادشي', 'راكد', 'راكدة',
            'مليت', 'ضريت', 'تعبت', 'ما قدرتش', 'صعيب', 'صعيبة',
            'معقد', 'معقدة', 'وعر', 'واعرة', 'مشكلة', 'مشاكل',
            'نفسي', 'نغزة', 'ممل', 'مملة', 'جاني', 'جتني',
            'متعب', 'متعبني', 'حاير', 'حايرني', 'تعبان', 'تعبانة'
        ]
    },
    {
        emotion: 'urgency',
        weight: 0.7,
        triggers_handoff: false,
        keywords: [
            'ضروري', 'بسرعة', 'درك', 'درك درك', 'الحقني', 'أسرع',
            'عاجل', 'مستعجل', 'بزاف', 'توا', 'تساع', 'باهية',
            'واش', 'واقع', 'بصح', 'خاصني', 'خاص', 'لازمني',
            'ضرو', 'ضروووو', 'أرجوك', 'رجاء', 'غدوة', 'غدوة غدوة',
            'الليلة', 'هادي', 'هذوما', 'واش راك', 'وين راه',
            'بغيت', 'باغي', 'حاب', 'حابة', 'نحوس'
        ]
    },
    {
        emotion: 'happiness',
        weight: 0.6,
        triggers_handoff: false,
        keywords: [
            'شكرا', 'شكراً', 'برك الله', 'بارك الله', 'الله يبارك',
            'مليح', 'مليحة', 'زوين', 'زوينة', 'عجبني', 'عجبتني',
            'واو', 'سوبر', 'ممتاز', 'رائع', 'جميل', 'جميلة',
            'بهي', 'بهية', 'عظيم', 'رايقة', 'نقية', 'نظيفة',
            'مرسي', 'merci', 'شكرا بزاف', 'الف شكر', 'مشكور',
            'تسلم', 'تسلمي', 'يعطيك الصحة', 'ربي يحفظك',
            'نشكرك', 'منورة', 'منور', 'تحفة', 'تحفة حقيقية'
        ]
    },
    {
        emotion: 'satisfaction',
        weight: 0.5,
        triggers_handoff: false,
        keywords: [
            'راضي', 'راضية', 'مقتنع', 'perfect', 'parfait',
            'excellent', 'bravo', 'برافو', 'تمام', 'تم',
            'نخدم', 'خدمت', 'خدم', 'جيد', 'جيدة',
            'ممتاز', 'ممتازة', 'ماشي', 'لا باس', 'لاباس',
            'نظيف', 'نظيفة', 'مرتب', 'مرتبة', 'قوي', 'قوية',
            'زي ما نحب', 'زي ما بغيت', 'هاد اللي كنت نحوس عليه'
        ]
    },
    {
        emotion: 'confusion',
        weight: 0.5,
        triggers_handoff: false,
        keywords: [
            'كيفاش', 'شنو', 'واش', 'فهمني', 'ما فهمتش', 'مافهمت',
            'تشرح', 'شرح', 'كيف', 'ماذا', 'ما معنى', 'معناه',
            'واش هي', 'شنو هو', 'أشنو', 'واش هذا', 'هاد شنو',
            'نقدر', 'كيف نطلب', 'كيفاش نطلب', 'الطريقة', 'الخطوات',
            'واش درت', 'واش كتبت', 'واش نقولو', 'مرتبك', 'متلخبط',
            'ضائع', 'توهت', 'ما عرفتش', 'ماعرفتش', 'مش عارف'
        ]
    },
    {
        emotion: 'disappointment',
        weight: 0.7,
        triggers_handoff: true,
        keywords: [
            'خايب', 'خايبة', 'ندمت', 'ندمان', 'ضيعت', 'ضيعتي',
            'ما كانش', 'ما كاينش', 'خلص', 'خلاص', 'تعب',
            'لا فايدة', 'ما نفعش', 'خسارة', 'خسارة فلوس',
            'هدرة', 'هدرة فارغة', 'وعد', 'وعود', 'قول', 'أقوال',
            'فيه', 'فيها', 'كاين', 'الظاهر', 'بان', 'بانلي',
            'رجيت', 'رجيت فيكم', 'ظنيت', 'ظنيت بيكم خير',
            'خابت', 'خابت ضنوني', 'انخدعت', 'خدعتوني'
        ]
    },
    {
        emotion: 'gratitude',
        weight: 0.4,
        triggers_handoff: false,
        keywords: [
            'ربي يجازيك', 'ربي يخليك', 'ربي يعطيك', 'ربي يرحم',
            'ربي ينجح', 'ربي يوفق', 'ربي يسعد', 'ربي يهنيك',
            'ربي معاك', 'ربي يبارك', 'جزاك الله', 'جازاك الله',
            'يعيشك', 'يعيش', 'يحفظك', 'يخليك', 'يديك الصحة',
            'ربي يرضى', 'ربي يحفظ', 'نشكر ربي', 'الحمد لله',
            'ربي كريم', 'شكراً جزيلاً', 'متشكر', 'متشكرة'
        ]
    },
    {
        emotion: 'curiosity',
        weight: 0.3,
        triggers_handoff: false,
        keywords: [
            'شنو', 'واش', 'كيف', 'عندكم', 'عندك', 'واش عندكم',
            'شنو عندكم', 'نحوس', 'نحوس على', 'بغيت', 'باغي',
            'حاب', 'حابة', 'نبغي', 'نحب', 'كاين', 'متوفر',
            'واش كاين', 'عندكم جديد', 'شنو الجديد', 'أخبار',
            'شنو الأخبار', 'واش تشوف', 'شنو تنصحني', 'شنو رايك'
        ]
    },
    {
        emotion: 'sarcasm',
        weight: 0.9,
        triggers_handoff: true,
        keywords: [
            'ماشي الخدمة', 'خدمة نظيفة', 'تمام التمام',
            'شكرا على الخدمة', 'خدمة فشار', 'خدمة مليون',
            'برافو عليكم', 'عاشت إيديكم', 'كلهم فلوس',
            'الزبون دايم', 'خدمة من الدرجة الأولى', 'هذي هي الخدمة',
            'متشكرين', 'متشكرين بزاف', 'الله غالب',
            'لا حول ولا قوة', 'حسبي الله', 'حسبي ربي',
            'نحولو عليك', 'وقتاش تشوفو', 'في أمان الله',
            'ربي مع الجماعة', 'الله يهدي', 'صبر', 'صبر جميل'
        ]
    }
];

const INTENT_RULES = [
    {
        intent: 'price_inquiry',
        keywords: [
            'شحال', 'بقداه', 'السعر', 'سومة', 'غالي', 'رخيص',
            'بكم', 'فلوس', 'دراهم', 'دج', 'ثمن', 'prix', 'combien',
            'قدره', 'قداه', 'شحال ثمن', 'كم سعر', 'شحال هادي', 'بقداه هادي'
        ]
    },
    {
        intent: 'delivery_inquiry',
        keywords: [
            'توصيل', 'توصلو', 'توصيلة', 'متى تجي', 'وقتاش', 'ولاية',
            'عنابة', 'وهران', 'قسنطينة', 'الجزائر', 'باتنة', 'سطيف',
            'تيزي', 'livraison', 'مدة التوصيل', 'كم يوم', 'شحال المدة',
            'الديليفري', 'ديليفري', 'tawssil'
        ]
    },
    {
        intent: 'size_inquiry',
        keywords: [
            'مقاس', 'قياس', 'مقاسات', 'xl', 'xxl', 'l', 'm', 's',
            'كبير', 'صغير', 'وسط', 'taille', 'pointure', 'طاي'
        ]
    },
    {
        intent: 'color_inquiry',
        keywords: [
            'لون', 'ألوان', 'أحمر', 'أزرق', 'أخضر', 'أصفر', 'أبيض',
            'أسود', 'بترولي', 'بيج', 'رمادي', 'بني', 'وردي', 'نيلي',
            'couleur', 'rouge', 'bleu', 'noir', 'blanc', 'كحلي', 'بوردو'
        ]
    },
    {
        intent: 'order_status',
        keywords: [
            'طلب', 'طلبية', 'ما وصلنيش', 'وين طلبي', 'متى يجي',
            'رقم التتبع', 'commande', 'suivi', 'الحالة', 'تتبع',
            'أين طلبي', 'آخر أخبار الطلب'
        ]
    },
    {
        intent: 'complaint',
        keywords: [
            'مشكل', 'معطوب', 'مكسور', 'ما عجبنيش', 'راجعو', 'نرجع',
            'استرجاع', 'مشكلة', 'retour', 'remboursement', 'شكوى',
            'ضرر', 'تالف', 'خربان', 'ما خدمش'
        ]
    },
    {
        intent: 'availability_inquiry',
        keywords: [
            'كاين', 'متوفر', 'موجود', 'ماكاينش', 'ستوك', 'stock',
            'disponible', 'في المخزون', 'عندكم', 'هل متوفر'
        ]
    },
    {
        intent: 'greeting',
        keywords: [
            'سلام', 'صباح', 'مساء', 'آش راك', 'لاباس', 'بونجور',
            'بسلامة', 'مرحبا', 'هلا', 'bonjour', 'salam', 'بخير',
            'السلام عليكم', 'وعليكم السلام', 'اهلا', 'bonsoir'
        ]
    },
    {
        intent: 'payment_inquiry',
        keywords: [
            'دفع', 'الدفع', 'دفع عند الاستلام', 'كارت', 'CCP', 'بريد',
            'paiement', 'تسديد', 'كاش', 'بطاقة', 'ccp', 'bared'
        ]
    },
    {
        intent: 'product_inquiry',
        keywords: [
            'قميص', 'بلوزة', 'تيشورت', 'سروال', 'بنطلون', 'جاكيت',
            'صباط', 'حزام', 'حقيبة', 'كاب', 'عطر', 'منتوج', 'سلعة',
            'صورة', 'منتجاتكم', 'عندكم', 'شنو', 'واش', 'المنتجات',
            'بيعو', 'تبيعو', 'متوفر عندكم', 'المنتوجات', 'السلع'
        ]
    },
    {
        intent: 'discount_inquiry',
        keywords: [
            'تخفيض', 'تخفيضات', 'عرض', 'عروض', 'خصم', 'برومو',
            'promo', 'تسوق', 'برومو كود', 'كود خصم'
        ]
    },
    {
        intent: 'working_hours',
        keywords: [
            'ساعات', 'ساعات العمل', 'وقت العمل', 'متى تفتحوا',
            'متى تقفلوا', 'اوراري', 'وقتاش تفتحوا', 'وقتاش تقفلوا'
        ]
    },
    {
        intent: 'store_info',
        keywords: [
            'وين', 'وين موقعكم', 'موقعكم', 'عنوان', 'adresse',
            'مقركم', 'المتجر', 'المحل', 'أين', 'أين مقركم'
        ]
    },
    {
        intent: 'return_policy',
        keywords: [
            'إرجاع', 'تبديل', 'استرجاع', 'مرتجعات', 'retour',
            'رجع', 'نبدل', 'شروط الإرجاع', 'سياسة الإرجاع'
        ]
    },
    {
        intent: 'perfume_inquiry',
        keywords: [
            'عطر', 'عطور', 'parfum', 'برفان', 'عطر رجالي', 'عطر نسائي'
        ]
    },
    {
        intent: 'shoe_inquiry',
        keywords: [
            'حذاء', 'أحذية', 'سنيكرز', 'صندل', 'sport', 'chaussure',
            'حذاء رياضي', 'حذاء رسمي', 'spорит'
        ]
    },
    {
        intent: 'how_to_order',
        keywords: [
            'كيفاش', 'كيفية', 'نطلب', 'الشراء', 'طريقة', 'تحميل',
            'طلب منتوج', 'واش نكتب', 'كيفاش نطلب', 'طريقة الطلب',
            'كيف نطلب', 'خطوات الطلب'
        ]
    }
];

const PRODUCT_KEYWORDS = [
    'قميص', 'بلوزة', 'تيشورت', 'سروال', 'بنطلون', 'جاكيت', 'كشمير',
    'صباط', 'حذاء', 'شال', 'حقيبة', 'كاب', 'عطر', 'ساعة', 'نظارة',
    'حزام', 'كنزة', 'رداء', 'فستان', 'بدلة', 'سترة', 'شورت', 'صندل',
    'محفظة', 'سنيكرز', 'ربطة عنق', 'برنيطة', 'قبعة', 'إكسسوارات'
];

function analyzeEmotions(text) {
    const lower = text.toLowerCase().trim();
    const words = lower.split(/\s+/).filter(w => w.length > 0);
    const results = [];

    for (const rule of EMOTION_RULES) {
        let matches = 0;
        for (const kw of rule.keywords) {
            if (lower.includes(kw)) matches++;
        }
        if (matches === 0) continue;

        const density = matches / words.length;
        const score = Math.min(1, density * 3 * rule.weight);
        results.push({
            emotion: rule.emotion,
            score: Math.round(score * 100) / 100,
            weight: rule.weight,
            triggers_handoff: rule.triggers_handoff
        });
    }

    results.sort((a, b) => b.score - a.score);

    const primary = results[0] || { emotion: 'neutral', score: 0, triggers_handoff: false };

    return {
        primary: primary.emotion,
        primaryScore: primary.score,
        emotions: results.slice(0, 3),
        allEmotions: results,
        needsHandoff: results.some(r => r.score >= 0.4 && r.triggers_handoff)
    };
}

function analyzeMessage(message) {
    const lower = message.toLowerCase().trim();

    const emotionResult = analyzeEmotions(message);

    let sentiment = 'neutral';
    const emotion = emotionResult.primary;
    if (['anger', 'frustration', 'disappointment', 'sarcasm'].includes(emotion)) {
        sentiment = 'negative';
    } else if (['happiness', 'satisfaction', 'gratitude'].includes(emotion)) {
        sentiment = 'positive';
    }

    let intent = 'general';
    let maxMatches = 0;
    for (const rule of INTENT_RULES) {
        const matches = rule.keywords.filter(kw => lower.includes(kw)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            intent = rule.intent;
        }
    }

    const keywords = PRODUCT_KEYWORDS.filter(kw => lower.includes(kw));

    return {
        intent,
        sentiment,
        emotion: emotionResult.primary,
        emotionScore: emotionResult.primaryScore,
        emotions: emotionResult.emotions,
        needsHandoff: emotionResult.needsHandoff,
        keywords
    };
}

function getEmotionResponse(emotion) {
    const responses = {
        anger: 'نأسف بزاف على ما حدث 🙏 حقك علينا. راح نحولك فوراً للموظف المسؤول باش يشوف مشكلتك.',
        frustration: 'نعتذر على الإزعاج 🙏 وصفلي المشكل وراح نعاونك بأسرع وقت. إذا كان معقد، نحولك للفريق.',
        urgency: 'نفهمك، راح نخدم بسرعة ⚡ قلي شحال حاب باش نعاونك.',
        happiness: 'الفرحة لنا 😊 تسلم على الكلمات الطيبة. دايماً في خدمتك.',
        satisfaction: 'نفرحوا بيك 🙌 نشكرك على ثقتك. واش حاب تشوف من المنتجات؟',
        confusion: 'ما ت worry 🤔 نعاونك. شنو اللي حاب تعرفه بالضبط؟',
        disappointment: 'نأسف نخيب ضنك 🙏 قلي شنو المشكل وراح نعاونك.',
        gratitude: 'الله يخليك 🤲 تسلم. دايماً في خدمتك.',
        curiosity: 'نفرحوا بسؤالك 😊 واش حاب تعرف بالضبط؟',
        sarcasm: 'نعتذر إذا تقصّرنا 🙏 راح نحولك للموظف مباشرة باش يشوف الموضوع.',
        neutral: ''
    };
    return responses[emotion] || '';
}

module.exports = { analyzeMessage, analyzeEmotions, getEmotionResponse };