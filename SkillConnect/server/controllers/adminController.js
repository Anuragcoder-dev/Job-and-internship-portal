const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorMiddleware');
const { getPagination, buildPaginationMeta } = require('../utils/paginationUtil');

async function logAdminAction(adminId, actionType, targetTable, targetId, details = null) {
  await pool.query(
    `INSERT INTO admin_actions (admin_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)`,
    [adminId, actionType, targetTable, targetId, details]
  );
}

// GET /api/admin/users
async function getUsers(req, res, next) {
  try {
    const { search, role, is_active } = req.query;
    const { page, limit, offset } = getPagination(req.query);

    const where = [];
    const params = [];
    if (search) { where.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (role) { where.push('role = ?'); params.push(role); }
    if (is_active !== undefined) { where.push('is_active = ?'); params.push(Number(is_active)); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users ${whereClause}`, params);
    const [rows] = await pool.query(
      `SELECT id, name, email, role, phone, is_active, is_verified, created_at
       FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ success: true, data: rows, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id/status  { is_active: 0|1 }
async function toggleUserStatus(req, res, next) {
  try {
    const { is_active } = req.body;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    await logAdminAction(req.user.id, is_active ? 'ENABLE_USER' : 'DISABLE_USER', 'users', req.params.id);
    res.json({ success: true, message: `User ${is_active ? 'enabled' : 'disabled'} successfully` });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/recruiters
async function getRecruiters(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT rp.id, rp.is_verified, rp.designation, u.name, u.email, u.is_active,
              c.name AS company_name
       FROM recruiter_profiles rp
       JOIN users u ON u.id = rp.user_id
       LEFT JOIN companies c ON c.recruiter_profile_id = rp.id
       ORDER BY rp.is_verified ASC, u.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/recruiters/:id/verify
async function verifyRecruiter(req, res, next) {
  try {
    await pool.query('UPDATE recruiter_profiles SET is_verified = 1 WHERE id = ?', [req.params.id]);
    await logAdminAction(req.user.id, 'VERIFY_RECRUITER', 'recruiter_profiles', req.params.id);
    res.json({ success: true, message: 'Recruiter verified successfully' });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/companies
async function getCompanies(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name AS recruiter_name, u.email AS recruiter_email
       FROM companies c JOIN recruiter_profiles rp ON rp.id = c.recruiter_profile_id
       JOIN users u ON u.id = rp.user_id ORDER BY c.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/jobs
async function getAllJobs(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM jobs');
    const [rows] = await pool.query(
      `SELECT j.id, j.title, j.status, j.job_type, j.created_at, c.name AS company_name,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
       FROM jobs j JOIN companies c ON c.id = j.company_id
       ORDER BY j.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ success: true, data: rows, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/jobs/:id  (remove inappropriate job)
async function removeJob(req, res, next) {
  try {
    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    await logAdminAction(req.user.id, 'REMOVE_JOB', 'jobs', req.params.id);
    res.json({ success: true, message: 'Job removed successfully' });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/applications
async function getAllApplications(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.status, a.match_score, a.applied_at, j.title AS job_title,
              u.name AS student_name, c.name AS company_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       JOIN student_profiles sp ON sp.id = a.student_profile_id
       JOIN users u ON u.id = sp.user_id
       ORDER BY a.applied_at DESC LIMIT 200`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/statistics
async function getStatistics(req, res, next) {
  try {
    const [[userStats]] = await pool.query(
      `SELECT SUM(role='student') AS total_students, SUM(role='recruiter') AS total_recruiters FROM users`
    );
    const [[companyStats]] = await pool.query(`SELECT COUNT(*) AS total_companies FROM companies`);
    const [[jobStats]] = await pool.query(
      `SELECT COUNT(*) AS total_jobs, SUM(status='active') AS active_jobs FROM jobs`
    );
    const [[appStats]] = await pool.query(`SELECT COUNT(*) AS total_applications FROM applications`);
    const [[pendingRecruiters]] = await pool.query(
      `SELECT COUNT(*) AS pending FROM recruiter_profiles WHERE is_verified = 0`
    );

    res.json({
      success: true,
      data: {
        totalStudents: userStats.total_students || 0,
        totalRecruiters: userStats.total_recruiters || 0,
        totalCompanies: companyStats.total_companies || 0,
        totalJobs: jobStats.total_jobs || 0,
        activeJobs: jobStats.active_jobs || 0,
        totalApplications: appStats.total_applications || 0,
        pendingRecruiterVerification: pendingRecruiters.pending || 0
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers, toggleUserStatus, getRecruiters, verifyRecruiter,
  getCompanies, getAllJobs, removeJob, getAllApplications, getStatistics
};
