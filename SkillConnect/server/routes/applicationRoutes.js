const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('student'), applicationController.applyForJob);
router.get('/my', protect, authorize('student'), applicationController.getMyApplications);
router.get('/:id', protect, applicationController.getApplicationById);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), applicationController.updateApplicationStatus);

module.exports = router;
