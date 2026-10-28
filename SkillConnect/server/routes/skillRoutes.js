const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', skillController.searchSkills);
router.post('/resolve', protect, skillController.resolveSkills);

module.exports = router;
