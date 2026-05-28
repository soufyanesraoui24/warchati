/**
 * aiController.js
 * نقاط نهاية API خاصة بالذكاء الاصطناعي - التحليل والتوليد والفحص
 */

const { analyzeMessage } = require('../services/messageAnalyzer');
const aiPipelineService = require('../services/aiPipelineService');
const { checkOllamaStatus } = require('../services/localAIService');
const responseHelper = require('../helpers/responseHelper');

/**
 * POST /api/ai/analyze
 * تحليل رسالة يدوياً - استخراج النية والمشاعر والكلمات المفتاحية
 */
exports.analyzeMessage = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return responseHelper.error(res, 'نص الرسالة مطلوب للتحليل', 400);
        }

        const analysis = analyzeMessage(text.trim());

        return responseHelper.success(res, {
            text: text.trim(),
            intent: analysis.intent,
            sentiment: analysis.sentiment,
            keywords: analysis.keywords
        }, 'تم تحليل الرسالة بنجاح');
    } catch (error) {
        console.error('❌ Error analyzing message:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء تحليل الرسالة', 500);
    }
};

/**
 * POST /api/ai/generate-reply
 * توليد رد ذكي لرسالة معينة
 */
exports.generateReply = async (req, res) => {
    try {
        const { text, conversationId } = req.body;

        if (!text || !text.trim()) {
            return responseHelper.error(res, 'نص الرسالة مطلوب لتوليد الرد', 400);
        }

        if (!conversationId) {
            return responseHelper.error(res, 'معرف المحادثة مطلوب', 400);
        }

        const result = await aiPipelineService.processMessage(text.trim(), conversationId);

        return responseHelper.success(res, {
            originalText: text.trim(),
            reply: result.text,
            intent: result.intent,
            sentiment: result.sentiment
        }, 'تم توليد الرد بنجاح');
    } catch (error) {
        console.error('❌ Error generating reply:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء توليد الرد', 500);
    }
};

/**
 * GET /api/ai/status
 * فحص حالة Ollama والنموذج المحلي
 */
exports.getBotStatus = async (req, res) => {
    try {
        const status = await checkOllamaStatus();

        const httpCode = status.running ? 200 : 503;
        return res.status(httpCode).json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('❌ Error checking bot status:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء فحص حالة البوت', 500);
    }
};
