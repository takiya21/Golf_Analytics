const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/coursesController');

// Get all courses
router.get('/', coursesController.getAllCourses);

// Get course details with holes
router.get('/:courseId', coursesController.getCourseDetails);

// Create course
router.post('/', coursesController.createCourse);

// Add holes to course
router.post('/:courseId/holes', coursesController.addHoles);

module.exports = router;
