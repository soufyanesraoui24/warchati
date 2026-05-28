const TemplateResponse = require('../models/TemplateResponse');

exports.getTemplates = async (req, res) => {
    try {
        const { productId } = req.query;
        const filter = {};
        if (productId) filter.productId = productId;
        const templates = await TemplateResponse.find(filter)
            .populate('productId', 'name price')
            .sort({ createdAt: -1 })
            .lean();
        templates.forEach(t => t.id = t._id);
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGeneralTemplates = async (req, res) => {
    try {
        const templates = await TemplateResponse.find({ productId: null })
            .sort({ createdAt: -1 })
            .lean();
        templates.forEach(t => t.id = t._id);
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductTemplates = async (req, res) => {
    try {
        const { productId } = req.params;
        const templates = await TemplateResponse.find({ productId })
            .sort({ createdAt: -1 })
            .lean();
        templates.forEach(t => t.id = t._id);
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTemplate = async (req, res) => {
    try {
        const { productId, questions, text, intent, isActive } = req.body;
        const qs = Array.isArray(questions) ? questions : (questions ? [questions] : []);
        const template = await TemplateResponse.create({ productId, questions: qs, text, intent, isActive });
        const templateObj = template.toObject();
        templateObj.id = templateObj._id;
        res.json(templateObj);
    } catch (error) {
        console.error('[Template] Create error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId, questions, text, intent, isActive } = req.body;
        const qs = Array.isArray(questions) ? questions : (questions ? [questions] : []);
        const template = await TemplateResponse.findByIdAndUpdate(
            id,
            { productId, questions: qs, text, intent, isActive },
            { new: true }
        );
        const templateObj = template.toObject();
        templateObj.id = templateObj._id;
        res.json(templateObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await TemplateResponse.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
