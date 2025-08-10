const express = require('express');
const router = express.Router();
const { createCourse } = require('../controllers/courseController');
const { verifyToken } = require('../middlewares/auth');
const Course = require('../models/Course');
const Group = require('../models/Group');
const CourseAssignment = require('../models/CourseAssignment');

// 📌 Upload a new course
router.post('/upload', verifyToken, createCourse);

// 📌 Get uploaded courses by instructor
router.get('/instructor', verifyToken, async (req, res) => {
  try {
    if (req.role !== 'instructor') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const courses = await Course.find({ uploadedBy: req.userId }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses', error: err.message });
  }
});

// 📌 Delete a course (instructor only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// 📌 Get all courses (admin or assignment UI)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all courses', error: err.message });
  }
});

// ✅ 📌 Get assigned courses for logged-in user (with logging and instructor info)
router.get('/assigned', verifyToken, async (req, res) => {
  try {
    if (req.role !== 'user') {
      return res.status(403).json({ message: 'Only users can view assigned courses' });
    }

    console.log('➡️ USER ID:', req.userId);

    // Find groups that include this user
    const userGroups = await Group.find({ users: req.userId }).select('_id name');
    console.log('✅ USER GROUPS:', userGroups);

    const groupIds = userGroups.map(g => g._id);

    if (groupIds.length === 0) {
      console.log('⚠️ No groups found for this user.');
      return res.status(200).json({ courses: [] });
    }

    // Find course assignments for the user's groups
    const assignments = await CourseAssignment.find({ group: { $in: groupIds } })
      .populate({
        path: 'course',
        populate: {
          path: 'uploadedBy',
          select: 'name email',
        },
      })
      .sort({ assignedAt: -1 });

    const courses = assignments.map(a => a.course).filter(Boolean);
    console.log('📦 ASSIGNED COURSES:', courses);

    res.json({ courses });
  } catch (err) {
    console.error('❌ Error in /assigned:', err.message);
    res.status(500).json({ message: 'Failed to fetch assigned courses' });
  }
});

module.exports = router;
