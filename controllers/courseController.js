const Course = require('../models/course');

exports.createCourse = async (req, res) => {
  const { title, description, videoUrl } = req.body;
  const userId = req.userId;
  const role = req.role;

  if (role !== 'instructor') return res.status(403).json({ message: 'Unauthorized' });

  try {
    const course = await Course.create({
      title,
      description,
      videoUrl,
      uploadedBy: userId,
    });
    res.status(201).json({ message: 'Course uploaded successfully', course });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};