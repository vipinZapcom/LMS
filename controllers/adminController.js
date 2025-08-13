const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Admin Signup
exports.adminSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password, role: 'admin' });

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    res.json({ accessToken: token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Get User Details by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user', error: err.message });
  }
};

// Update User by ID

// here if we are updating the role of admin to user
// then we should invalidate the token as well otherwise it will contain the 
// older value of role
exports.updateUserById = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

// Soft Delete User (Mark as inactive)
exports.deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User marked as inactive', user: deletedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};
