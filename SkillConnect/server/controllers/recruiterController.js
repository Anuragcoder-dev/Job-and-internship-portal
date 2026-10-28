const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorMiddleware');

// POST /api/recruiter/company
async function createOrUpdateCompany(req, res, next) {
  try {
    const { name, website, industry, company_size, description, location } = req.body;

    const [rpRows] = await pool.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    if (rpRows.length === 0) throw new AppError('Recruiter profile not found.', 404);
    const recruiterProfileId = rpRows[0].id;

    const [existing] = await pool.query('SELECT id FROM companies WHERE recruiter_profile_id = ?', [recruiterProfileId]);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE companies SET name=?, website=?, industry=?, company_size=?, description=?, location=? WHERE id=?`,
        [name, website || null, industry || null, company_size || null, description || null, location || null, existing[0].id]
      );
      return res.json({ success: true, message: 'Company profile updated', data: { id: existing[0].id } });
    }

    const [result] = await pool.query(
      `INSERT INTO companies (recruiter_profile_id, name, website, industry, company_size, description, location)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [recruiterProfileId, name, website || null, industry || null, company_size || null, description || null, location || null]
    );
    res.status(201).json({ success: true, message: 'Company profile created', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// POST /api/recruiter/company/logo
async function uploadLogo(req, res, next) {
  try {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    const [rpRows] = await pool.query('SELECT id FROM recruiter_profiles WHERE user_id = ?', [req.user.id]);
    await pool.query(
      'UPDATE companies SET logo_url = ? WHERE recruiter_profile_id = ?',
      [`logos/${req.file.filename}`, rpRows[0].id]
    );
    res.json({ success: true, message: 'Logo uploaded' });
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/jobs
async function getMyJobs(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, c.name AS company_name,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
       FROM jobs j JOIN companies c ON c.id = j.company_id
       WHERE j.posted_by = ? ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/applicants?job_id=
async function getApplicants(req, res, next) {
  try {
    const { job_id, status } = req.query;

    const where = ['j.posted_by = ?'];
    const params = [req.user.id];
    if (job_id) { where.push('a.job_id = ?'); params.push(job_id); }
    if (status) { where.push('a.status = ?'); params.push(status); }

    const [rows] = await pool.query(
      `SELECT a.id AS application_id, a.status, a.match_score, a.applied_at,
              j.id AS job_id, j.title AS job_title,
              sp.id AS student_profile_id, u.name AS student_name, u.email AS student_email,
              sp.headline, sp.location, r.id AS resume_id, r.file_name AS resume_file_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN student_profiles sp ON sp.id = a.student_profile_id
       JOIN users u ON u.id = sp.user_id
       LEFT JOIN resumes r ON r.id = a.resume_id
       WHERE ${where.join(' AND ')}
       ORDER BY a.match_score DESC, a.applied_at DESC`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/applicants/:studentProfileId
async function getApplicantProfile(req, res, next) {
  try {
    const [profileRows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.phone FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id WHERE sp.id = ?`,
      [req.params.studentProfileId]
    );
    if (profileRows.length === 0) throw new AppError('Applicant not found.', 404);
    const profile = profileRows[0];

    const [skills] = await pool.query(
      `SELECT s.name, ss.proficiency FROM student_skills ss JOIN skills s ON s.id = ss.skill_id
       WHERE ss.student_profile_id = ?`, [profile.id]
    );
    const [education] = await pool.query('SELECT * FROM education WHERE student_profile_id = ?', [profile.id]);
    const [experience] = await pool.query('SELECT * FROM experience WHERE student_profile_id = ?', [profile.id]);

    res.json({ success: true, data: { ...profile, skills, education, experience } });
  } catch (err) {
    next(err);
  }
}

// POST /api/recruiter/interviews
async function scheduleInterview(req, res, next) {
  try {
    const { application_id, scheduled_at, mode, location_or_link, interviewer_name, notes } = req.body;

    const [appRows] = await pool.query(
      `SELECT a.id, j.posted_by, sp.user_id AS student_user_id, j.title FROM applications a
       JOIN jobs j ON j.id = a.job_id JOIN student_profiles sp ON sp.id = a.student_profile_id
       WHERE a.id = ?`,
      [application_id]
    );
    if (appRows.length === 0) throw new AppError('Application not found.', 404);
    if (appRows[0].posted_by !== req.user.id) throw new AppError('Not authorized.', 403);

    const [result] = await pool.query(
      `INSERT INTO interviews (application_id, scheduled_at, mode, location_or_link, interviewer_name, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [application_id, scheduled_at, mode || 'online', location_or_link || null, interviewer_name || null, notes || null]
    );

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', ['interview', application_id]);
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'interview')`,
      [appRows[0].student_user_id, 'Interview Scheduled', `An interview has been scheduled for "${appRows[0].title}".`]
    );

    res.status(201).json({ success: true, message: 'Interview scheduled', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/stats
async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    const [[jobStats]] = await pool.query(
      `SELECT COUNT(*) AS total_jobs, SUM(status='active') AS active_jobs
       FROM jobs WHERE posted_by = ?`, [userId]
    );

    const [[appStats]] = await pool.query(
      `SELECT COUNT(*) AS total_applications,
              SUM(a.status='shortlisted') AS shortlisted,
              SUM(a.status='interview') AS interviews,
              SUM(a.status='selected') AS selected,
              SUM(a.status='rejected') AS rejected
       FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.posted_by = ?`, [userId]
    );

    res.json({
      success: true,
      data: {
        totalJobsPosted: jobStats.total_jobs || 0,
        activeJobs: jobStats.active_jobs || 0,
        totalApplications: appStats.total_applications || 0,
        shortlisted: appStats.shortlisted || 0,
        interviews: appStats.interviews || 0,
        selected: appStats.selected || 0,
        rejected: appStats.rejected || 0
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrUpdateCompany, uploadLogo, getMyJobs, getApplicants,
  getApplicantProfile, scheduleInterview, getDashboardStats
};
