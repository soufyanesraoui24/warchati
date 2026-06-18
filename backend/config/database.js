const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

const connectDB = async (retryCount = 0) => {
  const uri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/tajirtechdb';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`[DB] Retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retryCount + 1);
    }
    console.error('[DB] All retries exhausted. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
