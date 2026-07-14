const express = require('express');
const router = express.Router();
const { getRecentlyWatched } = require('../controllers/recentlyWatchedController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRecentlyWatched);

module.exports = router;
