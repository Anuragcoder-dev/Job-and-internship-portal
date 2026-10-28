const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadLogo } = require('../middleware/uploadMiddleware');

router.use(protect, authorize('recruiter'));

router.post('/company', recruiterController.createOrUpdateCompany);
router.post('/company/logo', uploadLogo.single('logo'), recruiterController.uploadLogo);

router.get('/jobs', recruiterController.getMyJobs);
router.get('/applicants', recruiterController.getApplicants);
router.get('/applicants/:studentProfileId', recruiterController.getApplicantProfile);

router.post('/interviews', recruiterController.scheduleInterview);
router.get('/stats', recruiterController.getDashboardStats);

module.exports = router;
