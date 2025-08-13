const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken } = require('../middlewares/auth');

// Public routes
router.get('/detail/all', courseController.getAllCourses);
router.get('/detail/:id', courseController.getCourseById);

// Protected routes
router.post('/create', verifyToken, courseController.createCourse);
router.put('/update/:id', verifyToken, courseController.updateCourse);
router.delete('/delete/:id', verifyToken, courseController.deleteCourse);
router.post('/assigned', verifyToken, courseController.assignCourseToGroups);
router.get('/video/:course_id', verifyToken, courseController.streamCourseVideo);
module.exports = router;
