const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192';
const GROQ_TIMEOUT = parseInt(process.env.GROQ_TIMEOUT_MS || '15000', 10);

async function generateGroqResponse(messages) {
    if (!GROQ_API_KEY) {
        console.error('[Groq] No API key set');
        return 'المساعد الذكي متوقف مؤقتاً. يرجى التواصل معنا مباشرة.';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT);

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                temperature: 0.1,
                max_tokens: 120,
                top_p: 0.5,
                stream: false
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                console.error('[Groq] Rate limited');
                return 'الخدمة مشغولة حالياً، حاول بعد شوية.';
            }
            throw new Error(`Groq error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (!data?.choices?.[0]?.message?.content) {
            throw new Error('Groq returned an empty response');
        }

        return data.choices[0].message.content.trim();

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            console.error(`[Groq] Timeout after ${GROQ_TIMEOUT / 1000}s`);
            return 'النظام شوية بطيء درك. حاول مرة أخرى من بعد.';
        }

        console.error('[Groq] Error:', error.message);
        return 'واجهنا مشكلة تقنية صغيرة. ضرك نحوّلك لأحد من الفريق يعاونك.';
    }
}

async function checkGroqStatus() {
    if (!GROQ_API_KEY) {
        return { running: false, message: 'GROQ_API_KEY غير مضبوط في ملف البيئة' };
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5
            })
        });

        if (response.ok) {
            return { running: true, model: GROQ_MODEL, message: `✅ Groq يعمل (${GROQ_MODEL})` };
        }

        const err = await response.text();
        return { running: false, model: GROQ_MODEL, message: `❌ Groq: ${err.substring(0, 100)}` };

    } catch {
        return { running: false, model: GROQ_MODEL, message: '❌ تعذر الاتصال بـ Groq' };
    }
}

async function warmupModel() {
    console.log('[Groq] No warmup needed');
}

module.exports = { generateGroqResponse, checkGroqStatus, warmupModel };