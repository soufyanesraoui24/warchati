const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['OWNER', 'MANAGER', 'WORKER', 'CLIENT', 'ADMIN', 'EMPLOYEE'], default: 'CLIENT' },
  phone: { type: String },
  avatar: { type: String },
  googleId: { type: String, sparse: true, unique: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
