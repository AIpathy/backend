const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const mlService = require('../services/mlService');

/**
 * @route POST /api/ai/chat
 * @desc Send text message to AI and get response
 * @access Private
 */
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // ML model ile AI yanıtı al
    let aiResponse = '';
    try {
      // ML model'e text mesajı gönder ve yanıt al
      const mlResponse = await mlService.generateTextResponse(message);
      
      if (mlResponse.success) {
        aiResponse = mlResponse.data.response;
      } else {
        // ML model başarısız olursa fallback yanıt
        aiResponse = 'Mesajınızı aldım. Size nasıl yardımcı olabilirim? Psikolojik durumunuz hakkında konuşmak ister misiniz? Ses analizi yaparak size daha detaylı yardım edebilirim.';
      }
    } catch (error) {
      console.error('ML model error:', error);
      // Hata durumunda basit yanıt
      aiResponse = 'Mesajınızı aldım. Size nasıl yardımcı olabilirim? Psikolojik durumunuz hakkında konuşmak ister misiniz?';
    }

    res.json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 