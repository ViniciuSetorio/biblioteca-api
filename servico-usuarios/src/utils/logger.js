const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME || 'unknown',
      message,
      ...meta
    }));
  },
  error: (message, error = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME || 'unknown',
      message,
      error: error.message || error,
      stack: error.stack
    }));
  }
};

export default logger;