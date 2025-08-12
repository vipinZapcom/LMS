const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Group = require('../models/Group');

// Get all groups (Only for admin)
router.get('/groups', verifyToken, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view groups' });
    }

    // Populating user data
    const groups = await Group.find()
      .populate('users', 'name email') // 👈 key line added here
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch groups', error: err.message });
  }
});

module.exports = router;
