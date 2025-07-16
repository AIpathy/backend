const { body, validationResult } = require('express-validator');
const Joi = require('joi');
const ApiError = require('../utils/ApiError');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg);
    throw new ApiError(400, 'Doğrulama hatası', messages);
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

//  Şifre güncelleme şeması
const passwordUpdateSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'currentPassword alanı zorunludur',
    'string.empty': 'currentPassword boş bırakılamaz'
  }),
  newPassword: Joi.string().min(6).required().invalid(Joi.ref('currentPassword')).messages({
    'any.required': 'newPassword alanı zorunludur',
    'string.empty': 'newPassword boş bırakılamaz',
    'string.min': 'newPassword en az 6 karakter olmalı',
    'any.invalid': 'Yeni şifre, mevcut şifreyle aynı olamaz'
  })
});

// Generic validator wrapper
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message)
    });
  }
  next();
};

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'İsim en az 2 karakter olmalı',
    'string.max': 'İsim en fazla 50 karakter olabilir'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Geçerli bir e-posta girin'
  })
}).or('name', 'email').messages({
  'object.missing': 'En az bir alan (name veya email) girilmeli'
});

module.exports = {
  validateLogin,
  validateRegister,
  validatePatient,
  validateAnalysis,
  handleValidationErrors,
  validatePasswordUpdate: validate(passwordUpdateSchema),
  validateProfileUpdate: validate(profileUpdateSchema)
}; 