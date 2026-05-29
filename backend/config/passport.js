const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (user) {
                user.googleId = profile.id;
                user.authProvider = 'google';
                user.avatar = user.avatar || profile.photos?.[0]?.value;
                await user.save();
            } else {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
                    googleId: profile.id,
                    authProvider: 'google',
                    avatar: profile.photos?.[0]?.value,
                    role: 'CLIENT',
                    password: undefined,
                });
            }
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const cleanUser = user.toObject ? { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } : user;
        return done(null, { user: cleanUser, token });
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
