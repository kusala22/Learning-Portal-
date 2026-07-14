const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Bookmark title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: 'Bookmark',
    },
    timestamp: {
      type: Number, // in seconds
      required: [true, 'Timestamp is required'],
      min: [0, 'Timestamp cannot be negative'],
    },
    timestampFormatted: {
      type: String,
      default: '00:00',
    },
    note: {
      type: String,
      maxlength: [1000, 'Note cannot exceed 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
bookmarkSchema.index({ userId: 1, videoId: 1 });
bookmarkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
