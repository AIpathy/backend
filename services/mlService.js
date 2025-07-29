const mlConfig = require('../config/ml');
const fs = require('fs');

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
      
      const fileName = audioFilePath.split('/').pop();
      // Dosya yolu (httpdocs/uploads)
      const mlModelPath = `/httpdocs/uploads/${fileName}`;
      
      console.log(`File available for ML model: ${mlModelPath}`);
      
      // Query parameter ile endpoint'i çağır
      const response = await fetch(`${ML_API_BASE_URL}/stt_emotion/?audio_file_path=${mlModelPath}`, {
        method: 'POST',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`ML API audio analysis failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          transcription: data.Transcription,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Audio emotion analysis failed:', error.message);
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
   * Generate text response using ML model
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
}

module.exports = new MLService(); 