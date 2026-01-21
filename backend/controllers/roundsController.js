const { db } = require('../database/db');

// Get all rounds
exports.getAllRounds = async (req, res) => {
  try {
    const rounds = await db.all(`
      SELECT 
        r.id, r.course_id, r.play_date, r.status,
        c.name as course_name,
        COUNT(DISTINCT rs.id) as hole_count
      FROM rounds r
      LEFT JOIN courses c ON r.course_id = c.id
      LEFT JOIN round_scores rs ON r.id = rs.round_id
      GROUP BY r.id
      ORDER BY r.play_date DESC
    `);
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get round details
exports.getRoundDetails = async (req, res) => {
  try {
    const { roundId } = req.params;
    
    const round = await db.get(`
      SELECT 
        r.*,
        c.name as course_name
      FROM rounds r
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.id = ?
    `, [roundId]);

    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }

    const scores = await db.all(`
      SELECT 
        rs.*,
        h.hole_number, h.par, h.yardage
      FROM round_scores rs
      LEFT JOIN holes h ON rs.hole_id = h.id
      WHERE rs.round_id = ?
      ORDER BY h.hole_number
    `, [roundId]);

    res.json({
      ...round,
      scores
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new round (draft)
exports.createRound = async (req, res) => {
  try {
    const { courseId, playDate } = req.body;

    if (!courseId || !playDate) {
      return res.status(400).json({ error: 'Course ID and play date are required' });
    }

    const courseExists = await db.get('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!courseExists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const result = await db.run(
      'INSERT INTO rounds (course_id, play_date, status) VALUES (?, ?, ?)',
      [courseId, playDate, 'draft']
    );

    // Create empty score records for all holes
    const holes = await db.all('SELECT id FROM holes WHERE course_id = ? ORDER BY hole_number', [courseId]);
    for (const hole of holes) {
      await db.run(
        'INSERT INTO round_scores (round_id, hole_id) VALUES (?, ?)',
        [result.lastID, hole.id]
      );
    }

    res.json({ id: result.lastID, courseId, playDate, status: 'draft' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update round
exports.updateRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const { scores } = req.body; // Array of {holeId, score, putts, ...}

    const roundExists = await db.get('SELECT id FROM rounds WHERE id = ?', [roundId]);
    if (!roundExists) {
      return res.status(404).json({ error: 'Round not found' });
    }

    for (const score of scores) {
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
        score.score,
        score.putts,
        score.firstClub,
        score.fairwayKept,
        score.greensOn,
        score.bogeyOn,
        score.obCount,
        score.bunkerCount,
        score.onePenalty,
        roundId,
        score.holeId
      ]);
    }

    res.json({ message: 'Round updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve/finalize round
exports.approveRound = async (req, res) => {
  try {
    const { roundId } = req.params;

    const roundExists = await db.get('SELECT id FROM rounds WHERE id = ?', [roundId]);
    if (!roundExists) {
      return res.status(404).json({ error: 'Round not found' });
    }

    await db.run('UPDATE rounds SET status = ? WHERE id = ?', ['approved', roundId]);
    
    res.json({ message: 'Round approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete round
exports.deleteRound = async (req, res) => {
  try {
    const { roundId } = req.params;

    await db.run('DELETE FROM round_scores WHERE round_id = ?', [roundId]);
    await db.run('DELETE FROM rounds WHERE id = ?', [roundId]);
    
    res.json({ message: 'Round deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
