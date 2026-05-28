const Product = require('../models/Product');
const { success, error, paginate } = require('../utils/responseHelper');

exports.getProducts = async (req, res) => {
    try {
        const { search, category, inStock, page = 1, limit = 20 } = req.query;
        const filter = { isActive: true };

        if (search) {
            filter.$text = { $search: search };
        }
        if (category) {
            filter.category = category;
        }
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        return paginate(res, products, Number(page), Number(limit), total);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) {
            return error(res, 'المنتج غير موجود', 404);
        }
        return success(res, product);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category, colors, sizes, stock, images } = req.body;

        if (!name || price === undefined) {
            return error(res, 'الاسم والسعر مطلوبان', 400);
        }

        const product = await Product.create({
            name, price, description, category, colors, sizes, stock, images
        });

        return success(res, product.toObject(), 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).lean();

        if (!product) {
            return error(res, 'المنتج غير موجود', 404);
        }
        return success(res, product);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).lean();

        if (!product) {
            return error(res, 'المنتج غير موجود', 404);
        }
        return success(res, { message: 'تم حذف المنتج بنجاح' });
    } catch (err) {
        return error(res, err.message, 500);
    }
};
