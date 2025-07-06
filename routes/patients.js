const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, requireDoctor } = require('../middleware/auth');
const { validatePatient } = require('../middleware/validation');

// All routes require authentication and doctor role
router.use(authenticateToken);
router.use(requireDoctor);

// GET /patients
router.get('/', patientController.getPatients);

// GET /patients/:id
router.get('/:id', patientController.getPatientById);

// GET /patients/:id/analyses
router.get('/:id/analyses', patientController.getPatientAnalyses);

// POST /patients
router.post('/', validatePatient, patientController.createPatient);

// PUT /patients/:id
router.put('/:id', validatePatient, patientController.updatePatient);

module.exports = router; 