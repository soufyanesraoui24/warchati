/**
 * whatsappService.js
 * خدمة التكامل مع WhatsApp Business API (هيكل للتطبيق المستقبلي)
 * حالياً: دوال وهمية (placeholder) تعيد رسائل في console
 */

const WHATSAPP_TOKEN   = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE   = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

const isConfigured = WHATSAPP_TOKEN && WHATSAPP_PHONE
    && WHATSAPP_TOKEN !== 'your_whatsapp_token_here';

if (isConfigured) {
    console.log('[WhatsApp] ✅ WHATSAPP_TOKEN exists');
} else {
    console.warn('[WhatsApp] ⚠️ WhatsApp not configured. Service disabled (Placeholder).');
}

/**
 * إرسال رسالة نصية عبر WhatsApp Business API
 * @param {string} to - رقم المستلم (بالصيغة الدولية: 213XXXXXXXXX)
 * @param {string} text - نص الرسالة
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendMessage(to, text) {
    if (!isConfigured) {
        console.log(`[WhatsApp] [Placeholder] Sending to ${to}: "${text}"`);
        return { success: true };
    }

    try {
        const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type':  'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: text }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[WhatsApp] Error sending message:', data.error?.message || response.statusText);
            return { success: false, error: data.error?.message || 'خطأ في WhatsApp API' };
        }

        console.log(`[WhatsApp] ✅ Message sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('[WhatsApp] Network error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * التحقق من رمز Webhook عند تسجيل التطبيق
 * @param {string} mode - mode من Facebook
 * @param {string} token - رمز التحقق
 * @returns {{ success: boolean, challenge?: string }}
 */
function verifyWebhookToken(mode, token) {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN;

    if (!VERIFY_TOKEN) {
        console.warn('[WhatsApp] ⚠️ WHATSAPP_VERIFY_TOKEN not set.');
        return { success: false };
    }

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[WhatsApp] ✅ Webhook verified successfully.');
        return { success: true, challenge: token };
    }

    console.warn('[WhatsApp] ❌ Webhook verification failed.');
    return { success: false };
}

module.exports = { sendMessage, verifyWebhookToken };
