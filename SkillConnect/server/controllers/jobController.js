const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorMiddleware');
const { getPagination, buildPaginationMeta } = require('../utils/paginationUtil');
const { calculateMatchScore } = require('../utils/matchingUtil');

// Helper: fetch skill rows for a set of job ids in one query
async function attachSkillsToJobs(jobs) {
  if (jobs.length === 0) return jobs;
  const jobIds = jobs.map(j => j.id);
  const [skillRows] = await pool.query(
    `SELECT js.job_id, s.id AS skill_id, s.name, js.is_mandatory
     FROM job_skills js JOIN skills s ON s.id = js.skill_id
     WHERE js.job_id IN (?)`,
    [jobIds]
  );
  const byJob = {};
  skillRows.forEach(row => {
    if (!byJob[row.job_id]) byJob[row.job_id] = [];
    byJob[row.job_id].push({ skill_id: row.skill_id, name: row.name, is_mandatory: !!row.is_mandatory });
  });
  return jobs.map(j => ({ ...j, skills: byJob[j.id] || [] }));
}

// GET /api/jobs  - advanced search + filter + sort + pagination (all server-side)
async function getJobs(req, res, next) {
  try {
    const {
      search, skill, company, location,
      job_type, experience_level,
      salary_min, salary_max,
      sort = 'latest'
    } = req.query;

    const { page, limit, offset } = getPagination(req.query);

    const where = ["j.status = 'active'"];
    const params = [];

    if (search) {
      where.push('(j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (company) {
      where.push('c.name LIKE ?');
      params.push(`%${company}%`);
    }
    if (location) {
      where.push('j.location LIKE ?');
      params.push(`%${location}%`);
    }
    if (job_type) {
      where.push('j.job_type = ?');
      params.push(job_type);
    }
    if (experience_level) {
      where.push('j.experience_level = ?');
      params.push(experience_level);
    }
    if (salary_min) {
      where.push('j.salary_max >= ?');
      params.push(Number(salary_min));
    }
    if (salary_max) {
      where.push('j.salary_min <= ?');
      params.push(Number(salary_max));
    }
    if (skill) {
      where.push(`j.id IN (SELECT job_id FROM job_skills js JOIN skills s ON s.id = js.skill_id WHERE s.name LIKE ?)`);
      params.push(`%${skill}%`);
    }

    let orderBy = 'j.created_at DESC';
    if (sort === 'salary_low') orderBy = 'j.salary_min ASC';
    if (sort === 'salary_high') orderBy = 'j.salary_max DESC';
    if (sort === 'latest') orderBy = 'j.created_at DESC';
    // 'relevance' falls back to latest unless a search term is present (handled by MySQL relevance ranking below)

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM jobs j JOIN companies c ON c.id = j.company_id ${whereClause}`,
      params
    );
    const totalItems = countRows[0].total;

    const [jobs] = await pool.query(
      `SELECT j.id, j.title, j.job_type, j.experience_level, j.location, j.is_remote,
              j.salary_min, j.salary_max, j.openings, j.status, j.application_deadline, j.created_at,
              c.id AS company_id, c.name AS company_name, c.logo_url
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const jobsWithSkills = await attachSkillsToJobs(jobs);

    res.json({
      success: true,
      data: jobsWithSkills,
      pagination: buildPaginationMeta(page, limit, totalItems)
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/:id
async function getJobById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, c.name AS company_name, c.logo_url, c.website, c.industry, c.location AS company_location
       FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) throw new AppError('Job not found.', 404);

    const [job] = await attachSkillsToJobs(rows);
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

// POST /api/jobs  (recruiter only)
async function createJob(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const {
      title, description, responsibilities, job_type, experience_level,
      location, is_remote, salary_min, salary_max, openings,
      application_deadline, skill_ids = [], mandatory_skill_ids = []
    } = req.body;

    // Look up the recruiter's company
    const [companyRows] = await conn.query(
      `SELECT c.id FROM companies c
       JOIN recruiter_profiles rp ON rp.id = c.recruiter_profile_id
       WHERE rp.user_id = ?`,
      [req.user.id]
    );
    if (companyRows.length === 0) {
      throw new AppError('Please create a company profile before posting jobs.', 400);
    }
    const companyId = companyRows[0].id;

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO jobs
       (company_id, posted_by, title, description, responsibilities, job_type, experience_level,
        location, is_remote, salary_min, salary_max, openings, application_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, req.user.id, title, description, responsibilities || null, job_type, experience_level || 'fresher',
       location, is_remote ? 1 : 0, salary_min || null, salary_max || null, openings || 1, application_deadline || null]
    );
    const jobId = result.insertId;

    const mandatorySet = new Set(mandatory_skill_ids);
    for (const skillId of skill_ids) {
      await conn.query(
        'INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES (?, ?, ?)',
        [jobId, skillId, mandatorySet.has(skillId) ? 1 : 0]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, message: 'Job posted successfully', data: { id: jobId } });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// PUT /api/jobs/:id  (recruiter, owner only)
async function updateJob(req, res, next) {
  try {
    const [jobRows] = await pool.query('SELECT posted_by FROM jobs WHERE id = ?', [req.params.id]);
    if (jobRows.length === 0) throw new AppError('Job not found.', 404);
    if (jobRows[0].posted_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('You are not authorized to edit this job.', 403);
    }

    const fields = ['title', 'description', 'responsibilities', 'job_type', 'experience_level',
      'location', 'is_remote', 'salary_min', 'salary_max', 'openings', 'status', 'application_deadline'];

    const updates = [];
    const params = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    });

    if (updates.length === 0) throw new AppError('No fields provided to update.', 400);

    params.push(req.params.id);
    await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Job updated successfully' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/jobs/:id
async function deleteJob(req, res, next) {
  try {
    const [jobRows] = await pool.query('SELECT posted_by FROM jobs WHERE id = ?', [req.params.id]);
    if (jobRows.length === 0) throw new AppError('Job not found.', 404);
    if (jobRows[0].posted_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('You are not authorized to delete this job.', 403);
    }

    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/jobs/:id/status  (activate/deactivate)
async function toggleJobStatus(req, res, next) {
  try {
    const { status } = req.body; // 'active' | 'inactive' | 'closed'
    if (!['active', 'inactive', 'closed'].includes(status)) {
      throw new AppError('Invalid status value.', 400);
    }
    await pool.query('UPDATE jobs SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Job marked as ${status}` });
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/recommended/me  (student only) - skill-based matching, no ML
async function getRecommendedJobs(req, res, next) {
  try {
    const [profileRows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (profileRows.length === 0) throw new AppError('Student profile not found.', 404);
    const studentProfileId = profileRows[0].id;

    const [studentSkillRows] = await pool.query(
      'SELECT skill_id FROM student_skills WHERE student_profile_id = ?',
      [studentProfileId]
    );
    const studentSkillIds = studentSkillRows.map(r => r.skill_id);

    const [jobs] = await pool.query(
      `SELECT j.id, j.title, j.job_type, j.location, j.salary_min, j.salary_max,
              c.name AS company_name, c.logo_url
       FROM jobs j JOIN companies c ON c.id = j.company_id
       WHERE j.status = 'active'
       ORDER BY j.created_at DESC
       LIMIT 50`
    );

    const jobsWithSkills = await attachSkillsToJobs(jobs);

    const ranked = jobsWithSkills
      .map(job => ({
        ...job,
        matchScore: calculateMatchScore(
          studentSkillIds,
          job.skills.map(s => ({ skill_id: s.skill_id, is_mandatory: s.is_mandatory }))
        )
      }))
      .filter(job => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    res.json({ success: true, data: ranked });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getJobs, getJobById, createJob, updateJob, deleteJob, toggleJobStatus, getRecommendedJobs
};
