const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mlService = require('../services/mlService');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || '/app/uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  }
});

// Geçici dosya temizleme fonksiyonu
const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temp file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to cleanup temp file ${filePath}:`, error.message);
  }
};

// Submit voice analysis
const submitVoiceAnalysis = async (req, res) => {
  let tempFilePath = null;
  
  try {
    upload.single('audio')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Audio file is required' });
      }

      const userId = req.user.id;
      tempFilePath = req.file.path;
      
      try {
        // ML API'ya ses dosyasını gönder ve ElevenLabs analizi al
        logger.info('Processing voice analysis', {
          userId: userId,
          tempFilePath: tempFilePath,
          fileSize: req.file.size
        });
        
        const mlResult = await mlService.analyzeAudioEmotion(tempFilePath);
        
        logger.info('ML API Result received', {
          success: mlResult.success,
          error: mlResult.error,
          hasData: !!mlResult.data,
          hasTranscription: !!(mlResult.data && mlResult.data.transcription)
        });
        
        // ML API'den response geldi mi kontrol et (success false olsa bile)
        const transcription = mlResult.data?.transcription || mlResult.data?.Transcription;
        if (mlResult.data && transcription) {
          logger.info('ML API response received, saving result to database', {
            transcription: transcription.substring(0, 100) + '...'
          });
          
          // Analiz sonucunu veritabanına kaydet
          const [result] = await pool.execute(
            'INSERT INTO analyses (user_id, type, score, details, file_path) VALUES (?, ?, ?, ?, ?)',
            [userId, 'voice', null, transcription, tempFilePath]
          );

          // Başarılı sonucu döndür
          res.status(201).json({
            message: 'Voice analysis completed successfully',
            analysis: {
              id: result.insertId,
              type: 'voice',
              transcription: transcription,
              emotion_analysis: mlResult.data.emotion_analysis || null,
              ai_comment: mlResult.data.ai_comment || null,
              analyzed_at: mlResult.data.timestamp,
              created_at: new Date(),
              warning: !mlResult.success ? 'Partial analysis completed' : undefined
            }
          });
          
        } else {
          // data yoksa error fırlat
          logger.error('ML Analysis failed - no data received', {
            error: mlResult.error,
            hasData: !!mlResult.data
          });
          throw new Error(`ML Analysis failed: ${mlResult.error || 'No data received'}`);
        }

      } catch (mlError) {
        logger.error('ML API Error in controller', {
          message: mlError.message,
          stack: mlError.stack
        });
        
        // ML API hatası durumunda fallback analiz
        const fallbackDetails = 'Ses analizi tamamlandı ancak detaylı analiz şu anda kullanılamıyor.';
        
        const [result] = await pool.execute(
          'INSERT INTO analyses (user_id, type, score, details, file_path) VALUES (?, ?, ?, ?, ?)',
          [userId, 'voice', null, fallbackDetails, tempFilePath]
        );

        res.status(201).json({
          message: 'Voice analysis completed with fallback',
          analysis: {
            id: result.insertId,
            type: 'voice',
            transcription: fallbackDetails,
            warning: 'AI analysis temporarily unavailable',
            created_at: new Date()
          }
        });
      } finally {
        // Geçici dosyayı temizle
        if (tempFilePath) {
          // Kısa bir gecikme sonrası temizle (dosya kullanımı tamamlansın)
          setTimeout(() => {
            cleanupTempFile(tempFilePath);
          }, 1000);
        }
      }
    });
  } catch (error) {
    console.error('Voice analysis error:', error);
    
    // Hata durumunda da geçici dosyayı temizle
    if (tempFilePath) {
      cleanupTempFile(tempFilePath);
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit test analysis (PHQ-9, GAD-7, etc.)
const submitTestAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, answers, score } = req.body;

    // Validate test type
    const validTypes = ['phq9', 'beck_anxiety', 'test'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid test type' });
    }

    // Generate details based on score
    let details = '';
    if (type === 'phq9') {
      if (score >= 20) details = 'Şiddetli depresyon belirtileri';
      else if (score >= 15) details = 'Orta düzey depresyon belirtileri';
      else if (score >= 10) details = 'Hafif depresyon belirtileri';
      else details = 'Minimal depresyon belirtileri';
    } else if (type === 'beck_anxiety') {
      if (score >= 15) details = 'Şiddetli anksiyete belirtileri';
      else if (score >= 10) details = 'Orta düzey anksiyete belirtileri';
      else if (score >= 5) details = 'Hafif anksiyete belirtileri';
      else details = 'Minimal anksiyete belirtileri';
    } else {
      details = 'Test analizi tamamlandı';
    }

    const [result] = await pool.execute(
      'INSERT INTO analyses (user_id, type, score, details) VALUES (?, ?, ?, ?)',
      [userId, type, score, details]
    );

    res.status(201).json({
      message: 'Test analysis submitted successfully',
      analysis: {
        id: result.insertId,
        type,
        score,
        details,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Test analysis error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user analyses
const getUserAnalyses = async (req, res) => {
  try {
    const userId = req.user.id;

    const [analyses] = await pool.execute(
      'SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(analyses);
  } catch (error) {
    console.error('Get user analyses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  submitVoiceAnalysis,
  submitTestAnalysis,
  getUserAnalyses
}; 