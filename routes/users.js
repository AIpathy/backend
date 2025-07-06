const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /user/profile
router.get('/profile', userController.getUserProfile);

// PUT /user/profile
router.put('/profile', userController.updateUserProfile);

module.exports = router; 