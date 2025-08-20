const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
require('dotenv').config();

// =========================
// POST /api/login/user/signup
// =========================
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const newUser = await User.create({ name, email, password, role });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// POST /api/login/user/login
// =========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(404).json({ message: "User not found or inactive" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).json({ message: "Login successful", accessToken: token, id: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// GET /api/user/detail/:id
// =========================
exports.getUserById = async (req, res) => {
  try {
    const queryField = req.params.id.includes("@") ? "email" : "_id";
    const user = await User.findOne({ [queryField]: req.params.id, isActive: true })
console.log(`user`);
console.log(user);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.log(`inside catch`);
    
    console.log(err.message);
    
    res.status(500).json({ message: err.message });
  }
};


// =========================
// PUT /api/user/update/:id
// =========================
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const updateData = { name, email, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// DELETE /api/user/:id (Soft Delete)
// =========================
exports.deactivateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// GET /api/user/detail/all
// =========================
exports.getAllUsers = async (req, res) => {
  console.log("Fetching all users");
  try {
    const users = await User.find({ isActive: true });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
