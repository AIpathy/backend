const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Login validation
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

// Register validation
const validateRegister = [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['user', 'doctor']).withMessage('User type must be user or doctor'),
  handleValidationErrors
];

// Patient validation
const validatePatient = [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  handleValidationErrors
];

// Analysis validation
const validateAnalysis = [
  body('type').isIn(['voice', 'facial', 'phq9', 'gad7', 'test']).withMessage('Invalid analysis type'),
  body('score').optional().isFloat({ min: 0, max: 10 }).withMessage('Score must be between 0 and 10'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validatePatient,
  validateAnalysis,
  handleValidationErrors
}; 