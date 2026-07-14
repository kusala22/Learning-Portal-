const Bookmark = require('../models/Bookmark');
const { formatDuration } = require('../utils/helpers');

// @desc    Get all bookmarks for a video (for current user)
// @route   GET /api/bookmarks/:videoId
// @access  Private
const getBookmarks = async (req, res) => {
  const bookmarks = await Bookmark.find({
    userId: req.user._id,
    videoId: req.params.videoId,
  }).sort({ timestamp: 1 });

  res.json({ success: true, count: bookmarks.length, bookmarks });
};

// @desc    Get all bookmarks for current user (all videos)
// @route   GET /api/bookmarks
// @access  Private
const getAllBookmarks = async (req, res) => {
  const bookmarks = await Bookmark.find({ userId: req.user._id })
    .populate('videoId', 'title thumbnail duration')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: bookmarks.length, bookmarks });
};

// @desc    Create a bookmark
// @route   POST /api/bookmarks
// @access  Private
const createBookmark = async (req, res) => {
  const { videoId, title, timestamp, note } = req.body;

  if (!videoId || timestamp === undefined) {
    return res.status(400).json({ success: false, message: 'videoId and timestamp are required' });
  }

  const bookmark = await Bookmark.create({
    userId: req.user._id,
    videoId,
    title: title || `Bookmark at ${formatDuration(timestamp)}`,
    timestamp: Math.floor(timestamp),
    timestampFormatted: formatDuration(Math.floor(timestamp)),
    note: note || '',
  });

  res.status(201).json({ success: true, bookmark });
};

// @desc    Update a bookmark
// @route   PUT /api/bookmarks/:id
// @access  Private
const updateBookmark = async (req, res) => {
  const bookmark = await Bookmark.findOne({ _id: req.params.id, userId: req.user._id });

  if (!bookmark) {
    return res.status(404).json({ success: false, message: 'Bookmark not found' });
  }

  const { title, note } = req.body;

  bookmark.title = title !== undefined ? title : bookmark.title;
  bookmark.note = note !== undefined ? note : bookmark.note;

  await bookmark.save();

  res.json({ success: true, bookmark });
};

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
const deleteBookmark = async (req, res) => {
  const bookmark = await Bookmark.findOne({ _id: req.params.id, userId: req.user._id });

  if (!bookmark) {
    return res.status(404).json({ success: false, message: 'Bookmark not found' });
  }

  await Bookmark.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Bookmark deleted successfully' });
};

module.exports = { getBookmarks, getAllBookmarks, createBookmark, updateBookmark, deleteBookmark };
