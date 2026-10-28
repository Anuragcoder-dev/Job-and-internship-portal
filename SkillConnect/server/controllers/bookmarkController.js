const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorMiddleware');

async function getStudentProfileId(userId) {
  const [rows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
  if (rows.length === 0) throw new AppError('Student profile not found.', 404);
  return rows[0].id;
}

// POST /api/bookmarks
async function addBookmark(req, res, next) {
  try {
    const { job_id } = req.body;
    const studentProfileId = await getStudentProfileId(req.user.id);

    const [existing] = await pool.query(
      'SELECT id FROM bookmarks WHERE student_profile_id = ? AND job_id = ?',
      [studentProfileId, job_id]
    );
    if (existing.length > 0) throw new AppError('Job already bookmarked.', 409);

    await pool.query('INSERT INTO bookmarks (student_profile_id, job_id) VALUES (?, ?)', [studentProfileId, job_id]);
    res.status(201).json({ success: true, message: 'Job bookmarked' });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookmarks
async function getBookmarks(req, res, next) {
  try {
    const studentProfileId = await getStudentProfileId(req.user.id);
    const [rows] = await pool.query(
      `SELECT b.id AS bookmark_id, b.created_at AS bookmarked_at,
              j.id AS job_id, j.title, j.job_type, j.location, j.salary_min, j.salary_max,
              c.name AS company_name, c.logo_url
       FROM bookmarks b
       JOIN jobs j ON j.id = b.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE b.student_profile_id = ?
       ORDER BY b.created_at DESC`,
      [studentProfileId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/bookmarks/:jobId
async function removeBookmark(req, res, next) {
  try {
    const studentProfileId = await getStudentProfileId(req.user.id);
    await pool.query(
      'DELETE FROM bookmarks WHERE student_profile_id = ? AND job_id = ?',
      [studentProfileId, req.params.jobId]
    );
    res.json({ success: true, message: 'Bookmark removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { addBookmark, getBookmarks, removeBookmark };
