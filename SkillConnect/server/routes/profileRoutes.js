const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

router.get('/', protect, userController.getProfile);
router.put('/', protect, userController.updateProfile);

router.post('/skills', protect, authorize('student'), userController.addSkill);
router.delete('/skills/:skillId', protect, authorize('student'), userController.removeSkill);

router.post('/education', protect, authorize('student'), userController.addEducation);
router.post('/experience', protect, authorize('student'), userController.addExperience);

router.post('/resume', protect, authorize('student'), uploadResume.single('resume'), userController.uploadResume);
router.get('/resume/:id/download', protect, userController.downloadResume);

module.exports = router;
