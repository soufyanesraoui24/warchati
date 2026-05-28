const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'CLIENT',
            phone,
            authProvider: 'local',
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            token
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.authProvider === 'google' && !user.password) {
            return res.status(400).json({
                message: 'This account uses Google login. Please sign in with Google.',
                provider: 'google'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const getMe = async (req, res) => {
    try {
        const { id, role } = req.user;

        // Handle mock users
        if (typeof id === 'string' && id.startsWith('mock_')) {
            const mockId = parseInt(id.replace('mock_', ''), 10);
            const mockUser = MOCK_USERS.find(u => u.id === mockId);
            if (!mockUser) {
                return res.status(404).json({ message: 'Mock user not found' });
            }
            return res.json({ id: mockUser.id, name: mockUser.name, role: mockUser.role, avatar: mockUser.name[0], email: mockUser.email });
        }

        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const MOCK_USERS = [
    { id: 1, name: 'Platform Owner', role: 'ADMIN', email: 'admin@warchati.dev' },
    { id: 2, name: 'Customer Support', role: 'EMPLOYEE', email: 'support@warchati.dev' },
    { id: 3, name: 'Sales Manager', role: 'MANAGER', email: 'manager@warchati.dev' },
    { id: 4, name: 'Test Client', role: 'CLIENT', email: 'client@warchati.dev' },
];

const mockLogin = async (req, res) => {
    try {
        const { userId } = req.body;
        const mockUser = MOCK_USERS.find(u => u.id === userId);

        if (!mockUser) {
            return res.status(400).json({ message: 'Invalid mock user ID' });
        }

        const token = jwt.sign(
            { id: `mock_${mockUser.id}`, role: mockUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Mock login successful',
            user: { id: mockUser.id, name: mockUser.name, role: mockUser.role, avatar: mockUser.name[0], email: mockUser.email },
            token
        });
    } catch (error) {
        console.error('Mock Login Error:', error);
        res.status(500).json({ message: 'Server error during mock login' });
    }
};

module.exports = { register, login, getMe, mockLogin };
