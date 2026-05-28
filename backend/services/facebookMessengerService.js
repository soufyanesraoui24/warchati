/**
 * facebookMessengerService.js
 * خدمة التكامل مع Facebook Messenger API (Graph API v18+)
 * تستخدم PAGE_ACCESS_TOKEN لإرسال الرسائل و VERIFY_TOKEN للتحقق من Webhook
 */

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN     = process.env.VERIFY_TOKEN;
const GRAPH_API_URL    = 'https://graph.facebook.com/v18.0/me/messages';

let isConfigured = false;

if (PAGE_ACCESS_TOKEN && PAGE_ACCESS_TOKEN !== 'your_page_access_token_here') {
    isConfigured = true;
    console.log('[FacebookMessenger] ✅ PAGE_ACCESS_TOKEN exists');
} else {
    console.warn('[FacebookMessenger] ⚠️ PAGE_ACCESS_TOKEN not set. Service disabled.');
}

/**
 * إرسال رسالة نصية عبر Facebook Messenger API
 * @param {string} senderId - معرّف المرسل (PSID)
 * @param {string} text - نص الرسالة
 * @returns {Promise<{success: boolean, response?: object, error?: string}>}
 */
async function sendMessage(senderId, text) {
    if (!isConfigured) {
        console.warn('[FacebookMessenger] Message not sent: PAGE_ACCESS_TOKEN not set.');
        return { success: false, error: 'PAGE_ACCESS_TOKEN غير مضبوط في البيئة.' };
    }

    if (!senderId || !text) {
        return { success: false, error: 'senderId و text مطلوبان.' };
    }

    try {
        const url = `${GRAPH_API_URL}?access_token=${PAGE_ACCESS_TOKEN}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: { id: senderId },
                message:   { text }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[FacebookMessenger] Error sending message:', data.error?.message || response.statusText);
            return { success: false, error: data.error?.message || 'خطأ في Facebook API' };
        }

        console.log(`[FacebookMessenger] ✅ Message sent to ${senderId}: "${text.substring(0, 50)}..."`);
        return { success: true, response: data };
    } catch (error) {
        console.error('[FacebookMessenger] Network error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * التحقق من رمز Webhook عند تسجيل التطبيق (Facebook Verification Challenge)
 * @param {string} mode - mode من Facebook (يجب أن يكون 'subscribe')
 * @param {string} token - رمز التحقق المرسل من Facebook
 * @returns {{ success: boolean, challenge?: string }}
 */
function verifyWebhookToken(mode, token) {
    if (!isConfigured) {
        console.warn('[FacebookMessenger] ⚠️ VERIFY_TOKEN not set. Cannot verify Webhook.');
        return { success: false };
    }

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[FacebookMessenger] ✅ Webhook verified successfully.');
        return { success: true, challenge: token };
    }

    console.warn('[FacebookMessenger] ❌ Webhook verification failed.');
    return { success: false };
}

module.exports = { sendMessage, verifyWebhookToken };
