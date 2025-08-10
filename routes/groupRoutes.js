const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Group = require('../models/Group');
const User = require('../models/User');

// ➕ Create group
router.post('/create', verifyToken, async (req, res) => {
  try {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Only admin can create groups' });

    const { name, userIds } = req.body;

    const group = await Group.create({
      name,
      users: userIds,
      createdBy: req.userId
    });

    res.status(201).json({ message: 'Group created', group });
  } catch (err) {
    res.status(500).json({ message: 'Group creation failed', error: err.message });
  }
});

// 📥 Get all users (to select for groups)
router.get('/users', verifyToken, async (req, res) => {
  try {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Only admin can view users' });

    const users = await User.find({ role: 'user' }).select('_id name email');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

module.exports = router;
