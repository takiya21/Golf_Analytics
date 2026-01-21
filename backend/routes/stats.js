const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Get overall statistics
router.get('/overall', statsController.getOverallStats);

// Get course statistics
router.get('/course/:courseId', statsController.getCourseStats);

// Get hole statistics
router.get('/hole/:holeId', statsController.getHoleStats);

module.exports = router;
