const mongoose = require('mongoose');

const recentlyWatchedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
    lastWatchedTime: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Unique compound index
recentlyWatchedSchema.index({ userId: 1, videoId: 1 }, { unique: true });
recentlyWatchedSchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('RecentlyWatched', recentlyWatchedSchema);
