/**
 * handoffService.js
 * نظام تحويل المحادثة لموظف بشري بناءً على تحليل الرسالة
 */

const Conversation = require('../models/Conversation');

// ─── Socket.IO للإشعارات الفورية ──────────────────────────────────────────────
function getIO() {
    try {
        return require('../config/socket').getIO();
    } catch {
        return null;
    }
}

/**
 * النوايا البسيطة التي يمكن الرد عليها تلقائياً دون تحويل
 */
const SIMPLE_INTENTS = new Set(['greeting', 'price_inquiry', 'size_inquiry', 'color_inquiry']);

/**
 * النوايا التي تستدعي التحويل لموظف بشري
 */
const HANDOFF_INTENTS = new Set(['complaint', 'order_status']);

/**
 * التحقق مما إذا كانت المحادثة تحتاج للتحويل لموظف بشري
 * @param {object} analysis - نتيجة التحليل { intent, sentiment, keywords, confidence }
 * @returns {{ needsHandoff: boolean, reason: string }}
 */
function shouldTransferToHuman(analysis) {
    const { intent, sentiment, confidence = 1.0 } = analysis;

    // 1. مشاعر سلبية أو غضب
    if (sentiment === 'negative') {
        return { needsHandoff: true, reason: 'المشاعر سلبية - الزبون غاضب أو غير راضٍ' };
    }

    if (sentiment === 'angry') {
        return { needsHandoff: true, reason: 'الزبون غاضب - يحتاج تدخل موظف بشري' };
    }

    // 2. نية شكوى أو متابعة طلب
    if (HANDOFF_INTENTS.has(intent)) {
        return { needsHandoff: true, reason: `نية "${intent}" تتطلب متابعة بشرية` };
    }

    // 3. ثقة منخفضة في التحليل
    if (confidence < 0.6) {
        return { needsHandoff: true, reason: `درجة الثقة منخفضة (${confidence}) - قد لا يفهم النظام الطلب` };
    }

    // 4. نية غير معروفة (عامة)
    if (intent === 'general' || intent === 'unknown') {
        return { needsHandoff: true, reason: 'نية غير محددة - قد يحتاج توضيحاً من موظف' };
    }

    return { needsHandoff: false, reason: '' };
}

/**
 * تفعيل التحويل البشري: تحديث حالة المحادثة + إشعار عبر Socket.IO
 * @param {string} conversationId
 * @param {string} reason - سبب التحويل
 * @returns {Promise<boolean>}
 */
async function triggerHandoff(conversationId, reason) {
    try {
        await Conversation.findByIdAndUpdate(conversationId, {
            status: 'HANDOFF',
            $set:   { handoffReason: reason, handoffAt: new Date() }
        });

        // إشعار فوري للموظفين عبر Socket.IO
        const io = getIO();
        if (io) {
            io.to('monitor_room').emit('handoff_alert', {
                conversationId,
                reason,
                timestamp: new Date().toISOString()
            });
            console.log(`[Handoff] 📡 Handoff notification sent for conversation ${conversationId}`);
        }

        console.log(`[Handoff] 🔄 Conversation ${conversationId} transferred to human agent. Reason: ${reason}`);
        return true;
    } catch (error) {
        console.error('[Handoff] Error transferring conversation:', error.message);
        return false;
    }
}

/**
 * التحقق مما إذا كان يمكن الرد تلقائياً على الطلب (بدون تحويل)
 * @param {object} analysis - نتيجة التحليل
 * @returns {boolean}
 */
function autoRespondIfSimple(analysis) {
    const { intent, sentiment } = analysis;

    // نية بسيطة مع مشاعر إيجابية أو محايدة
    if (SIMPLE_INTENTS.has(intent) && sentiment !== 'negative') {
        return true;
    }

    return false;
}

module.exports = {
    shouldTransferToHuman,
    triggerHandoff,
    autoRespondIfSimple
};
