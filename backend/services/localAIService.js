/**
 * localAIService.js
 * خدمة التواصل مع نموذج الذكاء الاصطناعي المحلي (Ollama)
 * تعمل عبر: http://localhost:11434
 *
 * للتشغيل:
 *   1. تحميل Ollama من: https://ollama.com
 *   2. تنزيل النموذج:  ollama pull mistral
 *   3. تشغيل النموذج:  ollama run mistral
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL || 'mistral';
const OLLAMA_TIMEOUT  = parseInt(process.env.OLLAMA_TIMEOUT_MS || '60000', 10);

/**
 * يرسل قائمة رسائل إلى Ollama ويعيد رد النموذج
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>} - نص الرد
 */
async function generateLocalResponse(messages) {
    const url = `${OLLAMA_BASE_URL}/api/chat`;

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

    try {
        const response = await fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            signal:  controller.signal,
            body: JSON.stringify({
                model:    OLLAMA_MODEL,
                messages,
                stream:   false,
                options: {
                    temperature: 0.2,   // منخفضة لردود دقيقة ومتوقعة
                    num_predict: 80,    // حد أقصى للكلمات (ردود قصيرة فقط)
                    top_k: 20,
                    top_p: 0.7,
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        // التحقق من صحة الرد
        if (!data?.message?.content) {
            throw new Error('Ollama returned an empty or malformed response.');
        }

        return data.message.content.trim();

    } catch (error) {
        clearTimeout(timeoutId);

        // رسائل خطأ مفيدة حسب نوع الخطأ
        if (error.name === 'AbortError') {
            console.error(`[LocalAI] Timeout: Ollama did not respond within ${OLLAMA_TIMEOUT / 1000} seconds`);
            return 'سمحلي خويا، النظام شوية بطيء درك. حاول مرة أخرى من بعد.';
        }

        if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
            console.error('[LocalAI] Ollama not running on port 11434. Run: ollama run mistral');
            return 'المساعد الذكي متوقف مؤقتاً. يرجى التواصل معنا مباشرة.';
        }

        console.error('[LocalAI] Unexpected error:', error.message);
        return 'واجهنا مشكلة تقنية صغيرة. ضرك نحوّلك لأحد من الفريق يعاونك.';
    }
}

/**
 * التحقق من أن Ollama يعمل بشكل صحيح
 * @returns {Promise<{running: boolean, model: string, message: string}>}
 */
async function checkOllamaStatus() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return { running: false, model: OLLAMA_MODEL, message: 'Ollama يعمل لكن يوجد خطأ في الاتصال' };
        }

        const data = await response.json();
        const availableModels = data.models?.map(m => m.name) || [];
        const modelLoaded = availableModels.some(m => m.startsWith(OLLAMA_MODEL));

        return {
            running: true,
            model:   OLLAMA_MODEL,
            modelLoaded,
            availableModels,
            message: modelLoaded
                ? `✅ Ollama يعمل والنموذج "${OLLAMA_MODEL}" محمّل`
                : `⚠️ Ollama يعمل لكن النموذج "${OLLAMA_MODEL}" غير محمّل. شغّل: ollama pull ${OLLAMA_MODEL}`
        };
    } catch {
        return {
            running: false,
            model:   OLLAMA_MODEL,
            message: `❌ Ollama غير مشغّل. شغّل: ollama run ${OLLAMA_MODEL}`
        };
    }
}

module.exports = { generateLocalResponse, checkOllamaStatus };
