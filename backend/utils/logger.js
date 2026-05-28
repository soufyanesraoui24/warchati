const isDev = process.env.NODE_ENV !== 'production';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const timestamp = () => new Date().toISOString();

const log = (level, color, ...args) => {
  const prefix = isDev ? `${color}[${level.toUpperCase()}]${colors.reset}` : `[${level.toUpperCase()}]`;
  console.log(`${colors.gray}${timestamp()}${colors.reset} ${prefix}`, ...args);
};

const logger = {
  info: (...args) => log('info', colors.green, ...args),
  warn: (...args) => log('warn', colors.yellow, ...args),
  error: (...args) => log('error', colors.red, ...args),
  debug: (...args) => {
    if (isDev) log('debug', colors.cyan, ...args);
  }
};

module.exports = logger;
