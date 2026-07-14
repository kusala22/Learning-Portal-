const Video = require('../models/Video');
const { cloudinary } = require('../config/cloudinary');
const { formatDuration } = require('../utils/helpers');

// @desc    Get all videos (with search & filter)
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res) => {
  const { search, category, sort = '-createdAt', page = 1, limit = 12 } = req.query;

  const query = { isPublished: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(category, 'i') };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [videos, total] = await Promise.all([
    Video.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'),
    Video.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: videos.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    videos,
  });
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
const getVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  // Increment view count
  await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json({ success: true, video });
};

// @desc    Create video
// @route   POST /api/videos
// @access  Admin
const createVideo = async (req, res) => {
  const { title, description, videoUrl, thumbnail, duration, category, tags, instructor } = req.body;

  const durationNum = parseFloat(duration) || 0;

  const video = await Video.create({
    title,
    description,
    videoUrl: req.file?.path || videoUrl,
    publicId: req.file?.filename || '',
    thumbnail: thumbnail || `https://img.youtube.com/vi/default/mqdefault.jpg`,
    duration: durationNum,
    durationFormatted: formatDuration(durationNum),
    category: category || 'General',
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    instructor: instructor || 'GVCC Instructor',
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, video });
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Admin
const updateVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  const { title, description, videoUrl, thumbnail, duration, category, tags, instructor, isPublished } = req.body;

  const durationNum = duration ? parseFloat(duration) : video.duration;

  const updated = await Video.findByIdAndUpdate(
    req.params.id,
    {
      title: title || video.title,
      description: description || video.description,
      videoUrl: videoUrl || video.videoUrl,
      thumbnail: thumbnail || video.thumbnail,
      duration: durationNum,
      durationFormatted: formatDuration(durationNum),
      category: category || video.category,
      tags: tags ? tags.split(',').map((t) => t.trim()) : video.tags,
      instructor: instructor || video.instructor,
      isPublished: isPublished !== undefined ? isPublished : video.isPublished,
    },
    { new: true, runValidators: true }
  );

  res.json({ success: true, video: updated });
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Admin
const deleteVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  // Delete from Cloudinary if it has a publicId
  if (video.publicId) {
    await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
  }
  if (video.thumbnailPublicId) {
    await cloudinary.uploader.destroy(video.thumbnailPublicId);
  }

  await Video.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Video deleted successfully' });
};

// @desc    Get video categories
// @route   GET /api/videos/categories
// @access  Private
const getCategories = async (req, res) => {
  const categories = await Video.distinct('category', { isPublished: true });
  res.json({ success: true, categories: ['All', ...categories] });
};

module.exports = { getVideos, getVideo, createVideo, updateVideo, deleteVideo, getCategories };
