const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Assignment = require('../models/Assignment');

router.post('/assign', verifyToken, async (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

  const { courseId, groupId } = req.body;

  try {
    const existing = await Assignment.findOne({ course: courseId, group: groupId });
    if (existing) return res.status(400).json({ message: 'Already assigned' });

    const assignment = await Assignment.create({ course: courseId, group: groupId });
    res.status(201).json({ message: 'Course assigned successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Assignment failed', error: error.message });
  }
});

module.exports = router;
