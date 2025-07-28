const express = require('express');
const router = express.Router();
const mlService = require('../services/mlService');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/ml/health
 * @desc Check ML API health
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const result = await mlService.healthCheck();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'ML API is healthy',
        data: result.data
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'ML API is not available',
        error: result.error
      });
    }
  } catch (error) {
    console.error('ML health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/ml/analyze/:testType
 * @desc Analyze test results using ML
 * @access Private
 */
router.post('/analyze/:testType', authenticateToken, async (req, res) => {
  try {
    const { testType } = req.params;
    const testData = req.body;
    
    // Validate test type
    const validTestTypes = ['anxiety', 'borderline', 'narcissism', 'social_phobia', 'beck_depression', 'alcohol'];
    if (!validTestTypes.includes(testType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test type',
        validTypes: validTestTypes
      });
    }
    
    // Get appropriate ML service method
    const testMapping = mlService.getTestTypeMapping();
    const analyzeFunction = testMapping[testType];
    
    if (!analyzeFunction) {
      return res.status(400).json({
        success: false,
        message: 'Test type not supported'
      });
    }
    
    // Call ML service
    const result = await analyzeFunction(testData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Analysis completed successfully',
        data: {
          test_type: testType,
          risk_group: result.data.risk_group,
          ai_comment: result.data.ai_comment,
          analyzed_at: result.data.timestamp,
          user_id: req.user.id
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'ML analysis failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('ML analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/ml/analyze-audio
 * @desc Analyze audio emotion
 * @access Private
 */
router.post('/analyze-audio', authenticateToken, async (req, res) => {
  try {
    const { audioFilePath } = req.body;
    
    if (!audioFilePath) {
      return res.status(400).json({
        success: false,
        message: 'Audio file path is required'
      });
    }
    
    const result = await mlService.analyzeAudioEmotion(audioFilePath);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Audio analysis completed successfully',
        data: {
          transcription: result.data.transcription,
          analyzed_at: result.data.timestamp,
          user_id: req.user.id
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Audio analysis failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Audio analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/ml/combined-analysis
 * @desc Analyze test + audio combined
 * @access Private
 */
router.post('/combined-analysis', authenticateToken, async (req, res) => {
  try {
    const { testType, testData, audioFilePath } = req.body;
    
    if (!testType || !testData) {
      return res.status(400).json({
        success: false,
        message: 'Test type and test data are required'
      });
    }
    
    // Analyze test first
    const testMapping = mlService.getTestTypeMapping();
    const analyzeFunction = testMapping[testType];
    
    if (!analyzeFunction) {
      return res.status(400).json({
        success: false,
        message: 'Test type not supported'
      });
    }
    
    const testResult = await analyzeFunction(testData);
    
    let audioResult = null;
    if (audioFilePath) {
      audioResult = await mlService.analyzeAudioEmotion(audioFilePath);
    }
    
    const response = {
      success: true,
      message: 'Combined analysis completed',
      data: {
        test_analysis: testResult.success ? testResult.data : { error: testResult.error },
        audio_analysis: audioResult?.success ? audioResult.data : audioResult ? { error: audioResult.error } : null,
        analyzed_at: new Date().toISOString(),
        user_id: req.user.id
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Combined analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 