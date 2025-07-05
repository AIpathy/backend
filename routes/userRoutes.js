const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const db = require('../config/db');

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Kullanıcı profilini getirir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri başarıyla getirildi
 *       401:
 *         description: Yetkisiz erişim
 */


router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [user] = await db.execute('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.json(user[0]);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

module.exports = router;
