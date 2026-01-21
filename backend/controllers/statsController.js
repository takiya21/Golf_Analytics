const { db } = require('../database/db');

// Get overall statistics
exports.getOverallStats = async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT r.id) as total_rounds,
        COUNT(DISTINCT r.course_id) as courses_played,
        ROUND(AVG(rs.score), 2) as avg_score,
        ROUND(AVG(rs.putts), 2) as avg_putts,
        MIN(rs.score) as best_score,
        MAX(rs.score) as worst_score,
        ROUND(SUM(CASE WHEN rs.fairway_kept = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(CASE WHEN rs.fairway_kept IS NOT NULL THEN 1 END), 0), 2) as fairway_kept_rate
      FROM rounds r
      LEFT JOIN round_scores rs ON r.id = rs.round_id
      WHERE r.status = 'approved'
    `);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get course statistics
exports.getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const stats = await db.get(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT r.id) as rounds_played,
        ROUND(AVG(rs.score), 2) as avg_score,
        ROUND(AVG(rs.putts), 2) as avg_putts,
        MIN(rs.score) as best_score,
        MAX(rs.score) as worst_score
      FROM courses c
      LEFT JOIN rounds r ON c.id = r.course_id AND r.status = 'approved'
      LEFT JOIN round_scores rs ON r.id = rs.round_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [courseId]);

    if (!stats) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(stats);
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

    const stats = await db.get(`
      SELECT 
        h.id,
        h.hole_number,
        h.par,
        h.yardage,
        COUNT(rs.id) as times_played,
        ROUND(AVG(rs.score), 2) as avg_score,
        ROUND(AVG(rs.putts), 2) as avg_putts,
        ROUND(AVG(rs.ob_count), 2) as avg_ob,
        ROUND(AVG(rs.bunker_count), 2) as avg_bunker,
        ROUND(SUM(CASE WHEN rs.fairway_kept = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(CASE WHEN rs.fairway_kept IS NOT NULL THEN 1 END), 0), 2) as fairway_kept_rate,
        SUM(CASE WHEN rs.score < h.par THEN 1 ELSE 0 END) as eagles,
        SUM(CASE WHEN rs.score = h.par - 1 THEN 1 ELSE 0 END) as birdies,
        SUM(CASE WHEN rs.score = h.par THEN 1 ELSE 0 END) as pars,
        SUM(CASE WHEN rs.score = h.par + 1 THEN 1 ELSE 0 END) as bogeys,
        SUM(CASE WHEN rs.score > h.par + 1 THEN 1 ELSE 0 END) as double_bogeys_plus
      FROM holes h
      LEFT JOIN round_scores rs ON h.id = rs.hole_id
      LEFT JOIN rounds r ON rs.round_id = r.id AND r.status = 'approved'
      WHERE h.id = ?
      GROUP BY h.id
    `, [holeId]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
