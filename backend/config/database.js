const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/tajirtechdb';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
