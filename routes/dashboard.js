const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /dashboard/doctor/stats
router.get('/doctor/stats', dashboardController.getDoctorStats);

// GET /dashboard/user/stats
router.get('/user/stats', dashboardController.getUserStats);

// GET /alerts
router.get('/alerts', dashboardController.getAlerts);

// PUT /alerts/:id/read
router.put('/alerts/:id/read', dashboardController.markAlertAsRead);

module.exports = router; 