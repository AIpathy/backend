const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');

// POST /auth/login
router.post('/login', validateLogin, authController.login);

// POST /auth/register
router.post('/register', validateRegister, authController.register);

// POST /auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router; 