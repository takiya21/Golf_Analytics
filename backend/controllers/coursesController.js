const { db } = require('../database/db');
const fs = require('fs');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await db.all('SELECT * FROM courses ORDER BY name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get course details with holes
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await db.get('SELECT * FROM courses WHERE id = ?', [courseId]);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const holes = await db.all('SELECT * FROM holes WHERE course_id = ? ORDER BY hole_number', [courseId]);
    
    res.json({
      ...course,
      holes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Course name is required' });
    }

    const result = await db.run('INSERT INTO courses (name) VALUES (?)', [name]);
    res.json({ id: result.lastID, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add holes to course
exports.addHoles = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { holes } = req.body; // Array of {holeNumber, par, yardage}

    if (!Array.isArray(holes) || holes.length === 0) {
      return res.status(400).json({ error: 'Invalid holes data' });
    }

    const courseExists = await db.get('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!courseExists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    for (const hole of holes) {
      await db.run(
        'INSERT OR REPLACE INTO holes (course_id, hole_number, par, yardage) VALUES (?, ?, ?, ?)',
        [courseId, hole.holeNumber, hole.par, hole.yardage]
      );
    }

    res.json({ message: 'Holes added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
