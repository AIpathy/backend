const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/doctor-panel:
 *   get:
 *     summary: Sadece doktorların erişebileceği panel
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doktor paneline erişildi
 *       401:
 *         description: Yetkisiz erişim
 *       403:
 *         description: Erişim reddedildi
 */
router.get('/doctor-panel', verifyToken, verifyRole([2]), (req, res) => {
    res.json({ message: 'Doktor paneline hoş geldiniz.' });
});

module.exports = router;

