require('dotenv').config();

const config = {
  development: {
    ML_API_BASE_URL: 'http://localhost:8000',
    ML_API_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    HEALTH_CHECK_INTERVAL: 60000 // 1 minute
  },
  
  production: {
    ML_API_BASE_URL: process.env.ML_API_URL || 'http://aipathy-ml-model:8000', // Docker network içinde
    ML_API_TIMEOUT: 45000, // Production'da biraz daha uzun timeout
    RETRY_ATTEMPTS: 5,
    HEALTH_CHECK_INTERVAL: 300000, // 5 minutes
    EXTERNAL_URL: 'https://aipathy.xyz:8000' // External access için
  },
  
  test: {
    ML_API_BASE_URL: 'http://localhost:8000',
    ML_API_TIMEOUT: 10000, // Test'te kısa timeout
    RETRY_ATTEMPTS: 1,
    HEALTH_CHECK_INTERVAL: 30000
  }
};

const env = process.env.NODE_ENV || 'development';
const mlConfig = config[env];

// Override with environment variables if provided
if (process.env.ML_API_URL) {
  mlConfig.ML_API_BASE_URL = process.env.ML_API_URL;
}

if (process.env.ML_API_TIMEOUT) {
  mlConfig.ML_API_TIMEOUT = parseInt(process.env.ML_API_TIMEOUT);
}

module.exports = mlConfig; 