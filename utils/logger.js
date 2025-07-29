const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content + '\n');
  }

  info(message, data = null) {
    const logEntry = this.formatMessage('INFO', message, data);
    console.log(`[INFO] ${message}`);
    this.writeToFile('app.log', logEntry);
  }

  error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null;
    
    const logEntry = this.formatMessage('ERROR', message, errorData);
    console.error(`[ERROR] ${message}`, error || '');
    this.writeToFile('error.log', logEntry);
  }

  warn(message, data = null) {
    const logEntry = this.formatMessage('WARN', message, data);
    console.warn(`[WARN] ${message}`);
    this.writeToFile('app.log', logEntry);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatMessage('DEBUG', message, data);
      console.log(`[DEBUG] ${message}`);
      this.writeToFile('debug.log', logEntry);
    }
  }

  // ML servis detaylı loglar
  mlRequest(endpoint, requestData) {
    this.info('ML API Request', {
      endpoint,
      timestamp: this.getTimestamp(),
      requestData: {
        fileSize: requestData.fileSize,
        fileName: requestData.fileName,
        url: requestData.url
      }
    });
  }

  mlResponse(endpoint, responseData) {
    this.info('ML API Response', {
      endpoint,
      timestamp: this.getTimestamp(),
      responseData: {
        status: responseData.status,
        success: responseData.success,
        dataKeys: responseData.data ? Object.keys(responseData.data) : null
      }
    });
  }

  mlError(endpoint, error) {
    this.error('ML API Error', {
      endpoint,
      timestamp: this.getTimestamp(),
      error: {
        message: error.message,
        status: error.status,
        responseText: error.responseText
      }
    });
  }
}

module.exports = new Logger(); 