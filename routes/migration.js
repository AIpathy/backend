const express = require('express');
const router = express.Router();
const { addExpertiseLevelColumn } = require('../controllers/migrationController');

// Migration endpoint
router.post('/add-expertise-level', addExpertiseLevelColumn);

module.exports = router; 