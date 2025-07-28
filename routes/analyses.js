const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { authenticateToken } = require('../middleware/auth');
const { validateAnalysis } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// POST /analyses/voice
router.post('/voice', analysisController.submitVoiceAnalysis);

// POST /analyses/test
router.post('/test', validateAnalysis, analysisController.submitTestAnalysis);

// GET /analyses/user
router.get('/user', analysisController.getUserAnalyses);

module.exports = router; 