const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { productSchema } = require('../utils/validators');

router.get('/', auth, getProducts);
router.get('/:id', auth, getProductById);
router.post('/', auth, role('admin'), validate(productSchema), createProduct);
router.put('/:id', auth, role('admin'), validate(productSchema), updateProduct);
router.delete('/:id', auth, role('admin'), deleteProduct);

module.exports = router;
