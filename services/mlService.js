const mlConfig = require('../config/ml');
const fs = require('fs');
const logger = require('../utils/logger');
const axios = require('axios');

const { ML_API_BASE_URL, ML_API_TIMEOUT, RETRY_ATTEMPTS } = mlConfig;

class MLService {
  
  /**
   * Test ML API health
   */
  async healthCheck() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${ML_API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`ML API health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('ML API health check failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Predict anxiety level
   */
  async predictAnxiety(testData) {
    return this._makePrediction('/predict_anksiyete/', testData);
  }

  /**
   * Predict borderline
   */
  async predictBorderline(testData) {
    return this._makePrediction('/predict_borderline/', testData);
  }

  /**
   * Predict narcissism
   */
  async predictNarcissism(testData) {
    return this._makePrediction('/predict_narsizm/', testData);
  }

  /**
   * Predict social phobia
   */
  async predictSocialPhobia(testData) {
    return this._makePrediction('/predict_sosyal_fobi/', testData);
  }

  /**
   * Predict Beck depression
   */
  async predictBeckDepression(testData) {
    return this._makePrediction('/predict_beck_depresyon/', testData);
  }

  /**
   * Predict alcohol usage
   */
  async predictAlcohol(testData) {
    return this._makePrediction('/predict_alkol/', testData);
  }

  /**
   * Analyze audio emotion
   */
  async analyzeAudioEmotion(audioFilePath) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_API_TIMEOUT);
      
      // Dosyayı okuyup FormData ile ML API'ye gönder
      if (!fs.existsSync(audioFilePath)) {
        logger.error('Audio file not found', { audioFilePath });
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }
      
      const audioBuffer = fs.readFileSync(audioFilePath);
      const fileName = audioFilePath.split('/').pop();
      
      // FormData oluştur ve ses dosyasını ekle
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Dosya tipini belirle
      const mimeType = this.getMimeType(fileName);
      
      // Buffer'ı doğrudan ekle, options kullanma
      formData.append('audio', audioBuffer, fileName);
      
      const requestData = {
        fileSize: audioBuffer.length,
        fileName: fileName,
        mimeType: mimeType,
        url: `${ML_API_BASE_URL}/stt_emotion/`
      };
      
      logger.mlRequest('/stt_emotion/', requestData);
      
      // form-data paketi için headers'ı al
      const headers = formData.getHeaders();
      logger.debug('FormData Headers', {
        headers: headers,
        contentType: headers['content-type'],
        boundary: headers['content-type']?.split('boundary=')[1]
      });
      
      // ML API'ye dosyayı direkt gönder
      let response;
      
      try {
        // Raw buffer ile deneyelim (boundary sorunu için)
        logger.info('Trying raw buffer approach first');
        const rawResponse = await axios.post(`${ML_API_BASE_URL}/stt_emotion/`, audioBuffer, {
          headers: {
            'Content-Type': mimeType,
            'Content-Length': audioBuffer.length.toString()
          },
          timeout: ML_API_TIMEOUT,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
        
        response = {
          ok: rawResponse.status >= 200 && rawResponse.status < 300,
          status: rawResponse.status,
          statusText: rawResponse.statusText,
          headers: rawResponse.headers,
          json: () => Promise.resolve(rawResponse.data),
          text: () => Promise.resolve(JSON.stringify(rawResponse.data))
        };
      } catch (rawError) {
        logger.warn('Raw buffer failed, trying FormData', { error: rawError.message });
        
        try {
          // Raw buffer başarısız olursa FormData ile dene
          const axiosResponse = await axios.post(`${ML_API_BASE_URL}/stt_emotion/`, formData, {
            headers: headers,
            timeout: ML_API_TIMEOUT,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          });
          
          response = {
            ok: axiosResponse.status >= 200 && axiosResponse.status < 300,
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
            headers: axiosResponse.headers,
            json: () => Promise.resolve(axiosResponse.data),
            text: () => Promise.resolve(JSON.stringify(axiosResponse.data))
          };
        } catch (formDataError) {
          logger.error('Both raw buffer and FormData failed', { 
            rawError: rawError?.message,
            formDataError: formDataError?.message 
          });
          throw new Error(`ML API failed: ${rawError.message}`);
        }
      }
      
      clearTimeout(timeoutId);
      
      logger.info('ML API Response received', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.mlError('/stt_emotion/', {
          message: `ML API audio analysis failed: ${response.status} - ${errorText}`,
          status: response.status,
          responseText: errorText
        });
        throw new Error(`ML API audio analysis failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      logger.mlResponse('/stt_emotion/', {
        status: response.status,
        success: true,
        data: data
      });
      
      return {
        success: true,
        data: {
          transcription: data.transcription || data.Transcription || 'Ses analizi tamamlandı',
          emotion_analysis: data.emotion_analysis || data.emotion || data.transcription || null,
          ai_comment: data.ai_comment || data.AI_Yorum || data.transcription || null,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.mlError('/stt_emotion/', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generic prediction method
   */
  async _makePrediction(endpoint, testData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_API_TIMEOUT);
      
      const response = await fetch(`${ML_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ML API prediction failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          risk_group: data.Risk_Grubu,
          ai_comment: data.AI_Yorum,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`ML prediction failed for ${endpoint}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate text response
   */
  async generateTextResponse(message) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_API_TIMEOUT);
      
      const response = await fetch(`${ML_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`ML API chat failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          response: data.response,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Text response generation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get test type mapping for routing
   */
  getTestTypeMapping() {
    return {
      'anxiety': this.predictAnxiety.bind(this),
      'borderline': this.predictBorderline.bind(this),
      'narcissism': this.predictNarcissism.bind(this),
      'social_phobia': this.predictSocialPhobia.bind(this),
      'beck_depression': this.predictBeckDepression.bind(this),
      'alcohol': this.predictAlcohol.bind(this)
    };
  }

  getMimeType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'wav': 'audio/wav',
      'mp3': 'audio/mpeg',
      'm4a': 'audio/mp4',
      'webm': 'audio/webm',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac'
    };
    return mimeTypes[ext] || 'audio/wav';
  }
}

module.exports = new MLService(); 