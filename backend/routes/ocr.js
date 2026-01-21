const express = require('express');
const router = express.Router();
const multer = require('multer');
const ocrController = require('../controllers/ocrController');

const upload = multer({ dest: 'uploads/' });

// Upload image and extract data
router.post('/extract', upload.single('image'), ocrController.extractScoreCard);

// Get OCR result
router.get('/result/:resultId', ocrController.getOCRResult);

// Confirm OCR data and create round
router.post('/confirm', ocrController.confirmOCRData);

module.exports = router;
