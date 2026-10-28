const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('student'));
router.post('/', bookmarkController.addBookmark);
router.get('/', bookmarkController.getBookmarks);
router.delete('/:jobId', bookmarkController.removeBookmark);

module.exports = router;
