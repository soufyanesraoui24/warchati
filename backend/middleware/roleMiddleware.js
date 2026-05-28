const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'غير مصرح: لم يتم تسجيل الدخول' });
    }

    const normalized = req.user.role.toUpperCase();
    const allowed = allowedRoles.map((r) => r.toUpperCase());

    if (!allowed.includes(normalized)) {
      return res.status(403).json({
        message: `ممنوع: صلاحية '${req.user.role}' لا تملك الإذن للوصول إلى هذا المورد`
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
