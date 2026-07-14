const express = require('express');
const router = express.Router();
const { saveProgress, getProgress, getAllProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllProgress);
router.post('/', protect, saveProgress);
router.get('/:videoId', protect, getProgress);

module.exports = router;
