const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const CourseAssignment = require('../models/CourseAssignment');

// ✅ Assign a course to a group (Admin only)
router.post('/assign', verifyToken, async (req, res) => {
  try {
    const { courseId, groupId } = req.body;

    // Check role
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign courses' });
    }

    // Validate inputs
    if (!courseId || !groupId) {
      return res.status(400).json({ message: 'Course and group are required' });
    }

    // Prevent duplicate assignment
    const existing = await CourseAssignment.findOne({ course: courseId, group: groupId });
    if (existing) {
      return res.status(409).json({ message: 'Course already assigned to this group' });
    }

    // Create assignment
    const assignment = await CourseAssignment.create({ course: courseId, group: groupId });

    console.log('✅ Course assigned:', assignment);
    res.status(201).json({ message: 'Course assigned successfully', assignment });
  } catch (err) {
    console.error('❌ Assignment error:', err.message);
    res.status(500).json({ message: 'Failed to assign course' });
  }
});

module.exports = router;
