const express = require('express');
const router = express.Router();
const { register, login, getMe, mockLogin } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { authSchema } = require('../utils/validators');
const passport = require('../config/passport');

router.post('/register', validate(authSchema), register);
router.post('/login', validate(authSchema), login);
router.post('/mock-login', mockLogin);
router.get('/me', auth, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed`,
    }),
    (req, res) => {
        const { token, user } = req.user;
        const userEncoded = encodeURIComponent(JSON.stringify(user));
        res.redirect(
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}&user=${userEncoded}`
        );
    }
);

module.exports = router;
