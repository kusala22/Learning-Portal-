const User = require('../models/User');
const Video = require('../models/Video');
const Progress = require('../models/Progress');
const Bookmark = require('../models/Bookmark');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res) => {
  const [totalUsers, totalVideos, totalBookmarks, totalProgress] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Video.countDocuments({ isPublished: true }),
    Bookmark.countDocuments(),
    Progress.countDocuments(),
  ]);

  res.json({
    success: true,
    stats: { totalUsers, totalVideos, totalBookmarks, totalProgress },
  });
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Admin
const getStudents = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = { role: 'student' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [students, total] = await Promise.all([
    User.find(query).skip(skip).limit(parseInt(limit)).select('-password').sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    students,
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
};

// @desc    Toggle student active status
// @route   PUT /api/admin/students/:id/toggle
// @access  Admin
const toggleStudentStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'admin') {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user, message: `Student ${user.isActive ? 'activated' : 'deactivated'}` });
};

// @desc    Delete a student
// @route   DELETE /api/admin/students/:id
// @access  Admin
const deleteStudent = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'admin') {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  await Promise.all([
    User.findByIdAndDelete(req.params.id),
    Progress.deleteMany({ userId: req.params.id }),
    Bookmark.deleteMany({ userId: req.params.id }),
  ]);

  res.json({ success: true, message: 'Student deleted successfully' });
};

module.exports = { getStats, getStudents, toggleStudentStatus, deleteStudent };
