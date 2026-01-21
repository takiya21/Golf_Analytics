const { db } = require('../database/db');

// Get hole details
exports.getHoleDetails = async (req, res) => {
  try {
    const { holeId } = req.params;
    
    const hole = await db.get('SELECT * FROM holes WHERE id = ?', [holeId]);
    if (!hole) {
      return res.status(404).json({ error: 'Hole not found' });
    }

    res.json(hole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get hole statistics
exports.getHoleStats = async (req, res) => {
  try {
    const { holeId } = req.params;

    const hole = await db.get('SELECT * FROM holes WHERE id = ?', [holeId]);
    if (!hole) {
      return res.status(404).json({ error: 'Hole not found' });
    }

    const stats = await db.all(`
      SELECT 
        rs.score,
        rs.putts,
        rs.first_club,
        rs.fairway_kept,
        rs.greens_on,
        rs.bogey_on,
        rs.ob_count,
        rs.bunker_count,
        rs.one_penalty,
        r.play_date
      FROM round_scores rs
      LEFT JOIN rounds r ON rs.round_id = r.id
      WHERE rs.hole_id = ? AND r.status = 'approved'
      ORDER BY r.play_date
    `, [holeId]);

    res.json({
      ...hole,
      history: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
