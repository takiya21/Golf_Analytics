const { db } = require('../database/db');
const { extractScoreCardData } = require('../utils/ocr');
const fs = require('fs');
const path = require('path');

// Extract scorecard from image
exports.extractScoreCard = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const ocrResult = await extractScoreCardData(req.file.path);

    if (!ocrResult.success) {
      return res.status(400).json({ error: ocrResult.error });
    }

    // Save OCR result
    const result = await db.run(
      'INSERT INTO ocr_results (raw_text, extracted_data, status) VALUES (?, ?, ?)',
      [ocrResult.rawText, JSON.stringify(ocrResult.parsedData), 'pending']
    );

    res.json({
      resultId: result.lastID,
      ...ocrResult.parsedData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get OCR result
exports.getOCRResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await db.get('SELECT * FROM ocr_results WHERE id = ?', [resultId]);
    if (!result) {
      return res.status(404).json({ error: 'OCR result not found' });
    }

    res.json({
      id: result.id,
      ...JSON.parse(result.extracted_data),
      status: result.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Confirm OCR data and create round
exports.confirmOCRData = async (req, res) => {
  try {
    const { resultId, courseName, playDate, scores } = req.body;

    if (!resultId || !courseName || !playDate || !scores) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const ocrResult = await db.get('SELECT * FROM ocr_results WHERE id = ?', [resultId]);
    if (!ocrResult) {
      return res.status(404).json({ error: 'OCR result not found' });
    }

    // Find or create course
    let course = await db.get('SELECT * FROM courses WHERE name = ?', [courseName]);
    if (!course) {
      const result = await db.run('INSERT INTO courses (name) VALUES (?)', [courseName]);
      course = { id: result.lastID, name: courseName };

      // Create holes for new course
      for (let i = 1; i <= 18; i++) {
        const holeData = scores[i];
        await db.run(
          'INSERT INTO holes (course_id, hole_number, par, yardage) VALUES (?, ?, ?, ?)',
          [course.id, i, holeData?.par || 4, holeData?.yardage || 0]
        );
      }
    }

    // Create round
    const roundResult = await db.run(
      'INSERT INTO rounds (course_id, play_date, status) VALUES (?, ?, ?)',
      [course.id, playDate, 'draft']
    );

    // Create and update score records
    const holes = await db.all('SELECT id, hole_number FROM holes WHERE course_id = ? ORDER BY hole_number', [course.id]);
    
    console.log(`Creating scores for round ${roundResult.lastID}. Found ${holes.length} holes.`);
    
    for (const hole of holes) {
      const holeNum = hole.hole_number;
      const scoreData = scores[holeNum];

      console.log(`Processing hole ${holeNum}: ${JSON.stringify(scoreData)}`);

      // Insert empty score record
      const scoreResult = await db.run(
        'INSERT INTO round_scores (round_id, hole_id) VALUES (?, ?)',
        [roundResult.lastID, hole.id]
      );
      console.log(`Inserted score record for hole ${holeNum}`);

      // Update with score data if provided
      if (scoreData) {
        await db.run(`
          UPDATE round_scores 
          SET 
            score = ?,
            putts = ?,
            first_club = ?,
            fairway_kept = ?,
            greens_on = ?,
            bogey_on = ?,
            ob_count = ?,
            bunker_count = ?,
            one_penalty = ?
          WHERE round_id = ? AND hole_id = ?
        `, [
          scoreData.score,
          scoreData.putts,
          scoreData.firstClub,
          scoreData.fairwayKept,
          scoreData.greensOn,
          scoreData.bogeyOn,
          scoreData.obCount,
          scoreData.bunkerCount,
          scoreData.onePenalty,
          roundResult.lastID,
          hole.id
        ]);
      }
    }

    // Update OCR result status
    await db.run('UPDATE ocr_results SET status = ? WHERE id = ?', ['confirmed', resultId]);

    res.json({
      roundId: roundResult.lastID,
      courseId: course.id,
      message: 'Round created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
