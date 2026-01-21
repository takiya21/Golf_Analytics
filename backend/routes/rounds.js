const express = require('express');
const router = express.Router();
const roundsController = require('../controllers/roundsController');

// Get all rounds
router.get('/', roundsController.getAllRounds);

// Get round details
router.get('/:roundId', roundsController.getRoundDetails);

// Create new round (draft)
router.post('/', roundsController.createRound);

// Update round
router.put('/:roundId', roundsController.updateRound);

// Approve/finalize round
router.post('/:roundId/approve', roundsController.approveRound);

// Delete round
router.delete('/:roundId', roundsController.deleteRound);

module.exports = router;
