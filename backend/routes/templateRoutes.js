const express = require('express');
const router = express.Router();
const {
    getTemplates,
    getGeneralTemplates,
    getProductTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
} = require('../controllers/templateController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, getTemplates);
router.get('/general', auth, getGeneralTemplates);
router.get('/product/:productId', auth, getProductTemplates);
router.post('/', auth, role('admin', 'employee', 'manager'), createTemplate);
router.put('/:id', auth, role('admin', 'employee', 'manager'), updateTemplate);
router.delete('/:id', auth, role('admin', 'employee', 'manager'), deleteTemplate);

module.exports = router;
