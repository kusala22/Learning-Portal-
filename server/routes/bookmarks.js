const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  getAllBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllBookmarks);
router.get('/:videoId', protect, getBookmarks);
router.post('/', protect, createBookmark);
router.put('/:id', protect, updateBookmark);
router.delete('/:id', protect, deleteBookmark);

module.exports = router;
