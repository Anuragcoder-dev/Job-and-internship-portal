const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);

router.get('/recruiters', adminController.getRecruiters);
router.put('/recruiters/:id/verify', adminController.verifyRecruiter);

router.get('/companies', adminController.getCompanies);

router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', adminController.removeJob);

router.get('/applications', adminController.getAllApplications);
router.get('/statistics', adminController.getStatistics);

module.exports = router;
