const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken } = require('../middlewares/auth');

// Public routes
router.get('/detail/:id', courseController.getCourseById);
router.get('/detail/all', courseController.getAllCourses);

// Protected routes
router.post('/create', verifyToken, courseController.createCourse);
router.put('/update/:id', verifyToken, courseController.updateCourse);
router.delete('/delete/:id', verifyToken, courseController.deleteCourse);
router.post('/course/assigned', verifyToken, courseController.assignCourseToGroups);
router.get('/video/:course_id', verifyToken, courseController.streamCourseVideo);
module.exports = router;
