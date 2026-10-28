const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorMiddleware');
const { calculateMatchScore } = require('../utils/matchingUtil');

async function getStudentProfileId(userId) {
  const [rows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
  if (rows.length === 0) throw new AppError('Student profile not found.', 404);
  return rows[0].id;
}

// POST /api/applications  (student only)
async function applyForJob(req, res, next) {
  try {
    const { job_id, cover_letter, resume_id } = req.body;
    const studentProfileId = await getStudentProfileId(req.user.id);

    const [jobRows] = await pool.query('SELECT id, status FROM jobs WHERE id = ?', [job_id]);
    if (jobRows.length === 0) throw new AppError('Job not found.', 404);
    if (jobRows[0].status !== 'active') throw new AppError('This job is no longer accepting applications.', 400);

    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE student_profile_id = ? AND job_id = ?',
      [studentProfileId, job_id]
    );
    if (existing.length > 0) throw new AppError('You have already applied to this job.', 409);

    // Compute match score at time of application
    const [studentSkillRows] = await pool.query(
      'SELECT skill_id FROM student_skills WHERE student_profile_id = ?', [studentProfileId]
    );
    const [jobSkillRows] = await pool.query(
      'SELECT skill_id, is_mandatory FROM job_skills WHERE job_id = ?', [job_id]
    );
    const matchScore = calculateMatchScore(studentSkillRows.map(r => r.skill_id), jobSkillRows);

    const [result] = await pool.query(
      `INSERT INTO applications (student_profile_id, job_id, resume_id, cover_letter, match_score)
       VALUES (?, ?, ?, ?, ?)`,
      [studentProfileId, job_id, resume_id || null, cover_letter || null, matchScore]
    );

    // Notify student
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'application')`,
      [req.user.id, 'Application Submitted', 'Your application has been submitted successfully.']
    );

    res.status(201).json({ success: true, message: 'Application submitted', data: { id: result.insertId, matchScore } });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/my  (student only) - view applied jobs + track status
async function getMyApplications(req, res, next) {
  try {
    const studentProfileId = await getStudentProfileId(req.user.id);
    const { status } = req.query;

    const where = ['a.student_profile_id = ?'];
    const params = [studentProfileId];
    if (status) {
      where.push('a.status = ?');
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT a.id, a.status, a.match_score, a.applied_at, a.updated_at,
              j.id AS job_id, j.title AS job_title, j.job_type, j.location,
              c.name AS company_name, c.logo_url
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE ${where.join(' AND ')}
       ORDER BY a.applied_at DESC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/:id
async function getApplicationById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, j.title AS job_title, j.posted_by, c.name AS company_name,
              sp.user_id AS student_user_id, u.name AS student_name, u.email AS student_email
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       JOIN student_profiles sp ON sp.id = a.student_profile_id
       JOIN users u ON u.id = sp.user_id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) throw new AppError('Application not found.', 404);

    const application = rows[0];
    const isOwnerStudent = application.student_user_id === req.user.id;
    const isOwnerRecruiter = application.posted_by === req.user.id;
    if (!isOwnerStudent && !isOwnerRecruiter && req.user.role !== 'admin') {
      throw new AppError('Not authorized to view this application.', 403);
    }

    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
}

// PUT /api/applications/:id/status  (recruiter/admin only)
async function updateApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) throw new AppError('Invalid application status.', 400);

    const [rows] = await pool.query(
      `SELECT a.id, j.posted_by, sp.user_id AS student_user_id, j.title AS job_title
       FROM applications a JOIN jobs j ON j.id = a.job_id JOIN student_profiles sp ON sp.id = a.student_profile_id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) throw new AppError('Application not found.', 404);
    if (rows[0].posted_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Not authorized to update this application.', 403);
    }

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'application')`,
      [rows[0].student_user_id, 'Application Status Updated',
       `Your application for "${rows[0].job_title}" is now: ${status.replace('_', ' ')}`]
    );

    res.json({ success: true, message: 'Application status updated' });
  } catch (err) {
    next(err);
  }
}

module.exports = { applyForJob, getMyApplications, getApplicationById, updateApplicationStatus };
