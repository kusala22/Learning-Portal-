const express = require('express');
const router = express.Router();
const { getStats, getStudents, toggleStudentStatus, deleteStudent } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/students', getStudents);
router.put('/students/:id/toggle', toggleStudentStatus);
router.delete('/students/:id', deleteStudent);

module.exports = router;
