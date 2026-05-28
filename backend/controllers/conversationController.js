/**
 * conversationController.js
 * إدارة المحادثات - التحكم بعمليات CRUD والمهام المتعلقة بالمحادثات
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const responseHelper = require('../helpers/responseHelper');

/**
 * GET /api/conversations
 * جلب قائمة المحادثات مع ترقيم الصفحات والتصفية
 */
exports.getConversations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // بناء فلتر البحث
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.platform) filter.platform = req.query.platform;
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // إخفاء المحادثات المحذوفة
        filter.status = filter.status || { $ne: 'DELETED' };

        const [conversations, total] = await Promise.all([
            Conversation.find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Conversation.countDocuments(filter)
        ]);

        // جلب آخر رسالة لكل محادثة
        for (const conv of conversations) {
            conv.id = conv._id;
            const lastMessage = await Message.findOne({ conversationId: conv._id })
                .sort({ createdAt: -1 })
                .lean();
            conv.lastMessage = lastMessage || null;
        }

        return responseHelper.paginated(res, conversations, total, page, limit);
    } catch (error) {
        console.error('❌ Error fetching conversations:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب المحادثات', 500);
    }
};

/**
 * GET /api/conversations/:id
 * جلب محادثة واحدة مع جميع رسائلها
 */
exports.getConversationById = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id).lean();
        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        conversation.id = conversation._id;
        conversation.messages = await Message.find({ conversationId: conversation._id })
            .sort({ createdAt: 1 })
            .lean();

        for (const msg of conversation.messages) {
            msg.id = msg._id;
        }

        return responseHelper.success(res, conversation);
    } catch (error) {
        console.error('❌ Error fetching conversation:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء جلب المحادثة', 500);
    }
};

/**
 * PUT /api/conversations/:id/status
 * تحديث حالة المحادثة (ACTIVE / HANDOFF / CLOSED)
 */
exports.updateConversationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['ACTIVE', 'HANDOFF', 'CLOSED', 'human_required'];

        if (!status || !validStatuses.includes(status)) {
            return responseHelper.error(res, 'حالة غير صالحة. الحالات المسموحة: ' + validStatuses.join(', '), 400);
        }

        const conversation = await Conversation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        const convObj = conversation.toObject();
        convObj.id = convObj._id;

        return responseHelper.success(res, convObj, 'تم تحديث حالة المحادثة بنجاح');
    } catch (error) {
        console.error('❌ Error updating conversation status:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء تحديث حالة المحادثة', 500);
    }
};

/**
 * PUT /api/conversations/:id/assign
 * تعيين محادثة لموظف
 */
exports.assignConversation = async (req, res) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return responseHelper.error(res, 'يرجى تحديد معرف الموظف', 400);
        }

        const employee = await User.findById(employeeId);
        if (!employee) {
            return responseHelper.error(res, 'الموظف غير موجود', 404);
        }

        const conversation = await Conversation.findByIdAndUpdate(
            req.params.id,
            { assignedTo: employeeId, status: 'HANDOFF' },
            { new: true }
        );

        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        const convObj = conversation.toObject();
        convObj.id = convObj._id;

        return responseHelper.success(res, convObj, 'تم تعيين المحادثة للموظف بنجاح');
    } catch (error) {
        console.error('❌ Error assigning conversation:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء تعيين المحادثة', 500);
    }
};

/**
 * PUT /api/conversations/:id/toggle-bot
 * تفعيل/تعطيل البوت للمحادثة
 */
exports.toggleBot = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        // التبديل بين ACTIVE (بوت مفعل) و HANDOFF (بوت معطل)
        const newStatus = conversation.status === 'ACTIVE' ? 'HANDOFF' : 'ACTIVE';
        conversation.status = newStatus;
        await conversation.save();

        const convObj = conversation.toObject();
        convObj.id = convObj._id;

        return responseHelper.success(res, convObj, newStatus === 'ACTIVE' ? 'تم تفعيل البوت' : 'تم إيقاف البوت');
    } catch (error) {
        console.error('❌ Error toggling bot state:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء تبديل حالة البوت', 500);
    }
};

/**
 * PUT /api/conversations/:id/toggle-ai
 * تفعيل/تعطيل الذكاء الاصطناعي للمحادثة (aiActive)
 */
exports.toggleAi = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        conversation.aiActive = !conversation.aiActive;
        await conversation.save();

        const convObj = conversation.toObject();
        convObj.id = convObj._id;

        return responseHelper.success(res, convObj, conversation.aiActive ? 'تم تفعيل الذكاء الاصطناعي' : 'تم إيقاف الذكاء الاصطناعي');
    } catch (error) {
        console.error('❌ Error toggling AI:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء تبديل الذكاء الاصطناعي', 500);
    }
};

/**
 * DELETE /api/conversations/:id
 * حذف المحادثة (حذف ناعم - تعيين الحالة إلى DELETED)
 */
exports.deleteConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findByIdAndUpdate(
            req.params.id,
            { status: 'DELETED' },
            { new: true }
        );

        if (!conversation) {
            return responseHelper.error(res, 'المحادثة غير موجودة', 404);
        }

        return responseHelper.success(res, null, 'تم حذف المحادثة بنجاح');
    } catch (error) {
        console.error('❌ Error deleting conversation:', error.message);
        return responseHelper.error(res, 'حدث خطأ أثناء حذف المحادثة', 500);
    }
};
