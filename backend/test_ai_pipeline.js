/**
 * test_ai_pipeline.js
 * اختبار شامل لخط أنابيب الذكاء الاصطناعي المحلي
 * يغطي جميع السيناريوهات المطلوبة بدون Ollama (اختبار محلي)
 *
 * التشغيل: node test_ai_pipeline.js
 */

require('dotenv').config();
const { analyzeMessage } = require('./services/messageAnalyzer');
const { checkOllamaStatus } = require('./services/localAIService');

// ─── ألوان طرفية ──────────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

function pass(msg) { console.log(`${GREEN}  ✅ ${msg}${RESET}`); }
function fail(msg) { console.log(`${RED}  ❌ ${msg}${RESET}`); }
function info(msg) { console.log(`${CYAN}  ℹ  ${msg}${RESET}`); }

// ─── حالات الاختبار ───────────────────────────────────────────────────────────
const TEST_CASES = [
    // السعر
    {
        label:           'سؤال عن السعر',
        message:         'شحال القميص؟',
        expectedIntent:  'price_inquiry',
        expectedSentiment: 'neutral',
    },
    // التوصيل
    {
        label:           'سؤال عن التوصيل لولاية',
        message:         'توصلو لقسنطينة؟',
        expectedIntent:  'delivery_inquiry',
        expectedSentiment: 'neutral',
    },
    // شكوى (handoff)
    {
        label:           'شكوى - ما وصلنيش الطلب',
        message:         'ما وصلنيش الطلب تاعي',
        expectedIntent:  'order_status',
        expectedSentiment: 'neutral',
    },
    // زبون غاضب (handoff)
    {
        label:           'زبون غاضب (يجب Handoff)',
        message:         'غاضب بزاف، غاشين ونهبتوني',
        expectedIntent:  'general',
        expectedSentiment: 'negative',
    },
    // لون المنتج
    {
        label:           'سؤال عن لون',
        message:         'كاين أزرق بترولي في الجاكيت؟',
        expectedIntent:  'color_inquiry',
        expectedSentiment: 'neutral',
        expectedKeywords: ['جاكيت'],
    },
    // مقاس
    {
        label:           'سؤال عن المقاس',
        message:         'واش كاين مقاس XL؟',
        expectedIntent:  'size_inquiry',
        expectedSentiment: 'neutral',
    },
    // توفر المنتج
    {
        label:           'سؤال عن توفر منتج',
        message:         'كاين قميص رجالي؟',
        expectedIntent:  'availability_inquiry',
        expectedSentiment: 'neutral',
        expectedKeywords: ['قميص'],
    },
    // تحية
    {
        label:           'تحية',
        message:         'سلام وعليكم',
        expectedIntent:  'greeting',
        expectedSentiment: 'neutral',
    },
    // الدفع
    {
        label:           'سؤال عن الدفع',
        message:         'كيفاش ندفع؟ الدفع عند الاستلام؟',
        expectedIntent:  'payment_inquiry',
        expectedSentiment: 'neutral',
    },
    // رضا الزبون
    {
        label:           'زبون راضي (مشاعر إيجابية)',
        message:         'شكرا بزاف، خدمة ممتازة',
        expectedIntent:  'general',
        expectedSentiment: 'positive',
    },
    // سؤال عن الكلمات المفتاحية
    {
        label:           'استخراج كلمة مفتاحية (تيشورت)',
        message:         'بغيت تيشورت أبيض مقاس L',
        expectedIntent:  'color_inquiry',
        expectedSentiment: 'neutral',
        expectedKeywords: ['تيشورت'],
    },
];

// ─── تشغيل الاختبارات ─────────────────────────────────────────────────────────
async function runTests() {
    console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}${CYAN}   اختبار خط أنابيب الذكاء الاصطناعي - وردة${RESET}`);
    console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}\n`);

    let passed = 0;
    let failed = 0;

    // ── 1. اختبار محلل الرسائل ──
    console.log(`${BOLD}${YELLOW}[1/2] اختبار محلل الرسائل (messageAnalyzer)${RESET}`);
    console.log('─'.repeat(50));

    for (const tc of TEST_CASES) {
        console.log(`\n  📨 "${tc.message}"`);
        const result = analyzeMessage(tc.message);

        // تحقق Intent
        if (result.intent === tc.expectedIntent) {
            pass(`Intent: ${result.intent}`);
            passed++;
        } else {
            fail(`Intent: تُوقّع "${tc.expectedIntent}" لكن الناتج "${result.intent}"`);
            failed++;
        }

        // تحقق Sentiment
        if (result.sentiment === tc.expectedSentiment) {
            pass(`Sentiment: ${result.sentiment}`);
            passed++;
        } else {
            fail(`Sentiment: تُوقّع "${tc.expectedSentiment}" لكن الناتج "${result.sentiment}"`);
            failed++;
        }

        // تحقق Keywords (اختياري)
        if (tc.expectedKeywords) {
            const allFound = tc.expectedKeywords.every(kw => result.keywords.includes(kw));
            if (allFound) {
                pass(`Keywords: [${result.keywords.join(', ')}]`);
                passed++;
            } else {
                fail(`Keywords: تُوقّع [${tc.expectedKeywords.join(', ')}] لكن الناتج [${result.keywords.join(', ')}]`);
                failed++;
            }
        } else {
            info(`Keywords: [${result.keywords.join(', ') || 'لا يوجد'}]`);
        }
    }

    // ── 2. اختبار الاتصال بـ Ollama ──
    console.log(`\n${BOLD}${YELLOW}[2/2] فحص اتصال Ollama${RESET}`);
    console.log('─'.repeat(50));

    const ollamaStatus = await checkOllamaStatus();
    if (ollamaStatus.running) {
        pass(`Ollama يعمل على ${process.env.OLLAMA_URL || 'http://localhost:11434'}`);
        if (ollamaStatus.modelLoaded) {
            pass(`النموذج "${ollamaStatus.model}" محمّل وجاهز للاستخدام`);
        } else {
            fail(`النموذج "${ollamaStatus.model}" غير محمّل — شغّل: ollama pull ${ollamaStatus.model}`);
            console.log(`\n  ${YELLOW}النماذج المتوفرة: ${ollamaStatus.availableModels?.join(', ') || 'لا يوجد'}${RESET}`);
        }
    } else {
        console.log(`\n  ${YELLOW}⚠️  ${ollamaStatus.message}${RESET}`);
        info('لا يؤثر هذا على اختبارات محلل الرسائل، لكن الردود الذكية ستتوقف.');
    }

    // ── النتيجة النهائية ──
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`${BOLD}النتيجة النهائية: ${passed} ✅ ناجح  |  ${failed} ❌ فاشل${RESET}`);
    if (failed === 0) {
        console.log(`${GREEN}${BOLD}🎉 جميع الاختبارات اجتازت بنجاح!${RESET}`);
    } else {
        console.log(`${YELLOW}⚠️  راجع الحالات الفاشلة وعدّل قواعد الكلمات المفتاحية في messageAnalyzer.js${RESET}`);
    }
    console.log('═'.repeat(50) + '\n');
}

runTests().catch(console.error);
