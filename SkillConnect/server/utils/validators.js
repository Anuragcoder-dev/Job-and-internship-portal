const { body, validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorMiddleware');

// Call as the last item in a route's validation chain array
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(e => e.msg).join(', ');
    return next(new AppError(message, 422));
  }
  next();
}

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'recruiter']).withMessage('Role must be student or recruiter')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const jobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('job_type').isIn(['full_time', 'part_time', 'internship', 'remote']).withMessage('Invalid job type'),
  body('location').trim().notEmpty().withMessage('Location is required')
];

module.exports = { validate, registerValidation, loginValidation, jobValidation };
