/**
 * responseHelper.js
 * توحيد تنسيق الاستجابات لجميع API endpoints
 */

/**
 * استجابة ناجحة
 */
exports.success = (res, data = null, message = 'تم بنجاح', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * استجابة خطأ
 */
exports.error = (res, message = 'حدث خطأ ما', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};

/**
 * استجابة مع ترقيم الصفحات
 */
exports.paginated = (res, data, total, page = 1, limit = 20) => {
    return res.json({
        success: true,
        data,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        }
    });
};
