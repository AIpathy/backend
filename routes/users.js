const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validatePasswordUpdate } = require('../middleware/validation');
const avatarUpload = require('../middleware/avatarUpload');


// All routes require authentication
router.use(authenticateToken);

// GET /user/profile
router.get('/profile', userController.getUserProfile);

// PUT /user/profile
router.put('/profile', userController.updateUserProfile);

router.put('/password', validatePasswordUpdate, userController.updatePassword);

// PATCH /user/avatar   
router.patch('/avatar',
    avatarUpload.single('avatar'),
    userController.uploadAvatar
);


module.exports = router; 