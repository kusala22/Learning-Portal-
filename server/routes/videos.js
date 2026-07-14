const express = require('express');
const router = express.Router();
const { getVideos, getVideo, createVideo, updateVideo, deleteVideo, getCategories } = require('../controllers/videoController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/categories', protect, getCategories);
router.get('/', protect, getVideos);
router.get('/:id', protect, getVideo);
router.post('/', protect, adminOnly, createVideo);
router.put('/:id', protect, adminOnly, updateVideo);
router.delete('/:id', protect, adminOnly, deleteVideo);

module.exports = router;
