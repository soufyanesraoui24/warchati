const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/tajirtechdb',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-this-in-production',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'mistral',
  OLLAMA_TIMEOUT_MS: parseInt(process.env.OLLAMA_TIMEOUT_MS, 10) || 60000,

  PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN || '',
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || '',

  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = env;
