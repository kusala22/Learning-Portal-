const Progress = require('../models/Progress');
const RecentlyWatched = require('../models/RecentlyWatched');
const { formatDuration } = require('../utils/helpers');

// @desc    Save or update watch progress
// @route   POST /api/progress
// @access  Private
const saveProgress = async (req, res) => {
  const { videoId, lastWatchedTime, progressPercentage, totalDuration } = req.body;

  if (!videoId) {
    return res.status(400).json({ success: false, message: 'videoId is required' });
  }

  const watchedTime = Math.floor(lastWatchedTime) || 0;
  const percentage = Math.min(Math.round(progressPercentage) || 0, 100);
  const completed = percentage >= 90;

  // Upsert progress
  const progress = await Progress.findOneAndUpdate(
    { userId: req.user._id, videoId },
    {
      lastWatchedTime: watchedTime,
      lastWatchedFormatted: formatDuration(watchedTime),
      progressPercentage: percentage,
      completed,
      $inc: { totalWatchTime: 5 }, // increment by ~5 seconds per save
    },
    { upsert: true, new: true }
  );

  // Update recently watched
  await RecentlyWatched.findOneAndUpdate(
    { userId: req.user._id, videoId },
    {
      watchedAt: new Date(),
      lastWatchedTime: watchedTime,
      progressPercentage: percentage,
    },
    { upsert: true, new: true }
  );

  res.json({ success: true, progress });
};

// @desc    Get progress for a specific video
// @route   GET /api/progress/:videoId
// @access  Private
const getProgress = async (req, res) => {
  const progress = await Progress.findOne({
    userId: req.user._id,
    videoId: req.params.videoId,
  });

  res.json({
    success: true,
    progress: progress || {
      lastWatchedTime: 0,
      lastWatchedFormatted: '00:00',
      progressPercentage: 0,
      completed: false,
    },
  });
};

// @desc    Get all progress for current user
// @route   GET /api/progress
// @access  Private
const getAllProgress = async (req, res) => {
  const progressList = await Progress.find({ userId: req.user._id })
    .populate('videoId', 'title thumbnail duration durationFormatted')
    .sort({ updatedAt: -1 });

  res.json({ success: true, progressList });
};

module.exports = { saveProgress, getProgress, getAllProgress };
