const BotSettings = require('../models/BotSettings');
const responseHelper = require('../helpers/responseHelper');

exports.getSettings = async (req, res) => {
    try {
        let settings = await BotSettings.findOne();
        if (!settings) {
            settings = await BotSettings.create({});
        }
        return responseHelper.success(res, settings);
    } catch (error) {
        console.error('Error fetching bot settings:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب الإعدادات', 500);
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const allowedFields = [
            'botName', 'autoReplyEnabled', 'languageStyle',
            'requireApprovalBeforeSend', 'workingHours', 'handoffOnNegative',
            'welcomeMessage', 'afterHoursMessage', 'fallbackMessage',
            'replyDelay', 'followUpEnabled', 'followUpDelay', 'followUpMessage'
        ];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }
        let settings = await BotSettings.findOne();
        if (!settings) {
            settings = new BotSettings(updates);
        } else {
            Object.assign(settings, updates);
        }
        await settings.save();
        return responseHelper.success(res, settings, 'تم حفظ الإعدادات بنجاح');
    } catch (error) {
        console.error('Error updating bot settings:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء حفظ الإعدادات', 500);
    }
};
