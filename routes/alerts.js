const express = require('express');
const router  = express.Router();
const { getAlertById } = require('../controllers/alertController');
const { authenticateToken, requireDoctor } = require('../middleware/auth');


const {
  getAlerts,
  markAlertAsRead,
  markAllAsRead,
  deleteAlert,
  deleteAllAlerts            
} = require('../controllers/alertController');


router.get('/:id', authenticateToken, requireDoctor, getAlertById);

// Sadece doktor kullanıcılar görebilsin
router.get('/', authenticateToken, requireDoctor, getAlerts);

// Tek uyarıyı okundu yap
router.put('/:id/read', authenticateToken, markAlertAsRead);

// Tüm uyarıları okundu yap
router.put('/read-all', authenticateToken, markAllAsRead);

// Uyarı sil
router.delete('/:id', authenticateToken, requireDoctor, deleteAlert);   // ← EKLENDİ

// Tüm uyarıları sil
router.delete('/', authenticateToken, requireDoctor, deleteAllAlerts);


module.exports = router;
