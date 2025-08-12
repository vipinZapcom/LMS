require('dotenv').config(); // Load .env variables

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

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

const courseRoutes = require('./routes/courseRoutes');
app.use('/api/course', courseRoutes);

const groupRoutes = require('./routes/groupRoutes');
app.use('/api/group', groupRoutes);

const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignments', assignmentRoutes);

const courseAssignmentRoute = require('./routes/courseAssignmentRoute');
app.use('/api/course-assign', courseAssignmentRoute); // matches frontend URL



const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);










// Health check
app.get('/', (req, res) => {
  res.send('LMS Backend API is running');
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
