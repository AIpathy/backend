const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Giriş, kayıt ve şifre sıfırlama işlemleri
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Kullanıcı kaydı yapar
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: "Role ID (1: user, 2: doctor, 3: admin) - Opsiyonel, varsayılan: 1 (user)"
 *     responses:
 *       201:
 *         description: Kayıt başarılı
 *       400:
 *         description: E-posta zaten kayıtlı
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı giriş yapar
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *       401:
 *         description: Geçersiz e-posta veya şifre
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Şifremi unuttum tokenı oluşturur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token oluşturuldu.
 *       404:
 *         description: Kullanıcı bulunamadı.
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Şifreyi sıfırlar
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Şifre başarıyla sıfırlandı.
 *       400:
 *         description: Geçersiz token.
 */
router.post('/reset-password', resetPassword);

module.exports = router;
