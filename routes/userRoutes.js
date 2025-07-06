const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
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
        const [user] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.json(user[0]); // role int olarak dön
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

/**
 * @swagger
 * /api/doctor-panel:
 *   get:
 *     summary: Sadece doctor rolüne izin verilen route
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor paneline erişildi
 *       403:
 *         description: Yetkisiz erişim
 */
router.get('/doctor-panel', verifyToken, verifyRole([2]), (req, res) => {
    res.json({ message: 'Doctor paneline hoş geldiniz.' });
});

/**
 * @swagger
 * /api/user-panel:
 *   get:
 *     summary: Sadece user rolüne izin verilen route
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User paneline erişildi
 *       403:
 *         description: Yetkisiz erişim
 */
router.get('/user-panel', verifyToken, verifyRole([1]), (req, res) => {
    res.json({ message: 'User paneline hoş geldiniz.' });
});

module.exports = router;
