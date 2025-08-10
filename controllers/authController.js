const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  let { name, email, password, role } = req.body;
  console.log('Before Registering user:', { name, email, role });
  if(name)
    name = name.trim();
  email = email.trim(); 
  console.log('Registering user:', { name, email, role });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  const role = req.params.role;

  try {
    const user = await User.findOne({ email: identifier, role });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    res.json({ accessToken: token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
