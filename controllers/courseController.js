const Course = require('../models/Course');

// Create a new course (protected)
exports.createCourse = async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      uploadedBy: req.user.id
    });
    await course.save();
    return res.status(201).json({ success: true, data: course });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get course details by ID (public)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.isDeleted) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Update course (protected)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course || course.isDeleted) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Only the original uploader can update
    if (course.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    Object.assign(course, req.body);
    await course.save();

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Soft delete course (protected)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Only the original uploader can delete
    if (course.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    course.isDeleted = true;
    await course.save();

    return res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get all courses (public)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isDeleted: false });
    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.assignCourseToGroups = async (req, res) => {
  try {
    const { courseId, groupIds } = req.body;

    if (!courseId || !groupIds || !Array.isArray(groupIds)) {
      return res.status(400).json({ success: false, message: 'courseId and groupIds array are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Avoid duplicates
    groupIds.forEach(groupId => {
      if (!course.assignedGroups.includes(groupId)) {
        course.assignedGroups.push(groupId);
      }
    });

    await course.save();
    res.status(200).json({ success: true, message: 'Course assigned to groups', data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
