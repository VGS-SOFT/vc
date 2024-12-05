const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/forgot-password', body('email').isEmail(), validate, authController.forgotPassword);

module.exports = router;