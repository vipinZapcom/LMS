require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());

const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const groupRoutes = require('./routes/groupRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const courseAssignmentRoute = require('./routes/courseAssignmentRoute');
// const adminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

app.use('/api', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/assignments', assignmentRoutes);
// app.use('/api/course-assign', courseAssignmentRoute); // matches frontend URL
// app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('LMS Backend API is running');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
