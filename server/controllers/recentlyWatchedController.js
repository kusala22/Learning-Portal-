const RecentlyWatched = require('../models/RecentlyWatched');

// @desc    Get recently watched videos for current user
// @route   GET /api/recently-watched
// @access  Private
const getRecentlyWatched = async (req, res) => {
  const { limit = 10 } = req.query;

  const recentlyWatched = await RecentlyWatched.find({ userId: req.user._id })
    .populate('videoId', 'title thumbnail duration durationFormatted category')
    .sort({ watchedAt: -1 })
    .limit(parseInt(limit));

  // Filter out any null videoId refs (deleted videos)
  const valid = recentlyWatched.filter((rw) => rw.videoId);

  res.json({ success: true, recentlyWatched: valid });
};

module.exports = { getRecentlyWatched };
