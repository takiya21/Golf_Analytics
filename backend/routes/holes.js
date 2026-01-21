const express = require('express');
const router = express.Router();
const holesController = require('../controllers/holesController');

// Get hole details
router.get('/:holeId', holesController.getHoleDetails);

// Get hole statistics
router.get('/:holeId/stats', holesController.getHoleStats);

module.exports = router;
