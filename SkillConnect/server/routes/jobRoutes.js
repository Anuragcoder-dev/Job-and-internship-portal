const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate, jobValidation } = require('../utils/validators');

// Public
router.get('/', jobController.getJobs);
router.get('/recommended/me', protect, authorize('student'), jobController.getRecommendedJobs);
router.get('/:id', jobController.getJobById);

// Recruiter only
router.post('/', protect, authorize('recruiter'), jobValidation, validate, jobController.createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), jobController.updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), jobController.deleteJob);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), jobController.toggleJobStatus);

module.exports = router;
