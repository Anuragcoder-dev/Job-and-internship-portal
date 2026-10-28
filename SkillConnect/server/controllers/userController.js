const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorMiddleware');

// GET /api/profile - returns role-appropriate profile
async function getProfile(req, res, next) {
  try {
    const { id: userId, role } = req.user;

    if (role === 'student') {
      const [profileRows] = await pool.query(
        `SELECT sp.*, u.name, u.email, u.phone FROM student_profiles sp
         JOIN users u ON u.id = sp.user_id WHERE sp.user_id = ?`,
        [userId]
      );
      if (profileRows.length === 0) throw new AppError('Profile not found.', 404);
      const profile = profileRows[0];

      const [skills] = await pool.query(
        `SELECT s.id, s.name, ss.proficiency FROM student_skills ss
         JOIN skills s ON s.id = ss.skill_id WHERE ss.student_profile_id = ?`,
        [profile.id]
      );
      const [education] = await pool.query('SELECT * FROM education WHERE student_profile_id = ?', [profile.id]);
      const [experience] = await pool.query('SELECT * FROM experience WHERE student_profile_id = ?', [profile.id]);
      const [resumes] = await pool.query('SELECT * FROM resumes WHERE student_profile_id = ? ORDER BY uploaded_at DESC', [profile.id]);

      return res.json({ success: true, data: { ...profile, skills, education, experience, resumes } });
    }

    if (role === 'recruiter') {
      const [profileRows] = await pool.query(
        `SELECT rp.*, u.name, u.email, u.phone FROM recruiter_profiles rp
         JOIN users u ON u.id = rp.user_id WHERE rp.user_id = ?`,
        [userId]
      );
      if (profileRows.length === 0) throw new AppError('Profile not found.', 404);
      const profile = profileRows[0];

      const [companies] = await pool.query('SELECT * FROM companies WHERE recruiter_profile_id = ?', [profile.id]);

      return res.json({ success: true, data: { ...profile, companies } });
    }

    // admin
    const [rows] = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [userId]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/profile
async function updateProfile(req, res, next) {
  try {
    const { id: userId, role } = req.user;
    const { name, phone, ...rest } = req.body;

    if (name || phone) {
      const updates = [];
      const params = [];
      if (name) { updates.push('name = ?'); params.push(name); }
      if (phone) { updates.push('phone = ?'); params.push(phone); }
      params.push(userId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    if (role === 'student') {
      const allowed = ['headline', 'bio', 'location', 'college', 'degree', 'graduation_year',
        'linkedin_url', 'github_url', 'portfolio_url', 'experience_level'];
      const updates = [];
      const params = [];
      allowed.forEach(f => {
        if (rest[f] !== undefined) { updates.push(`${f} = ?`); params.push(rest[f]); }
      });
      if (updates.length) {
        params.push(userId);
        await pool.query(`UPDATE student_profiles SET ${updates.join(', ')} WHERE user_id = ?`, params);
      }
    } else if (role === 'recruiter') {
      const allowed = ['designation', 'department'];
      const updates = [];
      const params = [];
      allowed.forEach(f => {
        if (rest[f] !== undefined) { updates.push(`${f} = ?`); params.push(rest[f]); }
      });
      if (updates.length) {
        params.push(userId);
        await pool.query(`UPDATE recruiter_profiles SET ${updates.join(', ')} WHERE user_id = ?`, params);
      }
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
}

// POST /api/profile/skills  (student)
async function addSkill(req, res, next) {
  try {
    const { skill_name, proficiency = 'intermediate' } = req.body;
    const [profileRows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const studentProfileId = profileRows[0].id;

    let [skillRows] = await pool.query('SELECT id FROM skills WHERE name = ?', [skill_name]);
    let skillId;
    if (skillRows.length === 0) {
      const [result] = await pool.query('INSERT INTO skills (name) VALUES (?)', [skill_name]);
      skillId = result.insertId;
    } else {
      skillId = skillRows[0].id;
    }

    await pool.query(
      `INSERT INTO student_skills (student_profile_id, skill_id, proficiency) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency)`,
      [studentProfileId, skillId, proficiency]
    );

    res.status(201).json({ success: true, message: 'Skill added' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/profile/skills/:skillId
async function removeSkill(req, res, next) {
  try {
    const [profileRows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    await pool.query(
      'DELETE FROM student_skills WHERE student_profile_id = ? AND skill_id = ?',
      [profileRows[0].id, req.params.skillId]
    );
    res.json({ success: true, message: 'Skill removed' });
  } catch (err) {
    next(err);
  }
}

// POST /api/profile/education
async function addEducation(req, res, next) {
  try {
    const { institution, degree, field_of_study, start_year, end_year, grade } = req.body;
    const [profileRows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);

    const [result] = await pool.query(
      `INSERT INTO education (student_profile_id, institution, degree, field_of_study, start_year, end_year, grade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [profileRows[0].id, institution, degree, field_of_study || null, start_year, end_year || null, grade || null]
    );
    res.status(201).json({ success: true, message: 'Education added', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// POST /api/profile/experience
async function addExperience(req, res, next) {
  try {
    const { company_name, job_title, start_date, end_date, is_current, description } = req.body;
    const [profileRows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);

    const [result] = await pool.query(
      `INSERT INTO experience (student_profile_id, company_name, job_title, start_date, end_date, is_current, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [profileRows[0].id, company_name, job_title, start_date, end_date || null, is_current ? 1 : 0, description || null]
    );
    res.status(201).json({ success: true, message: 'Experience added', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// POST /api/profile/resume  (multipart upload, field name "resume")
async function uploadResume(req, res, next) {
  try {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    const [profileRows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const studentProfileId = profileRows[0].id;

    // Unset previous primary resume
    await pool.query('UPDATE resumes SET is_primary = 0 WHERE student_profile_id = ?', [studentProfileId]);

    const [result] = await pool.query(
      `INSERT INTO resumes (student_profile_id, file_name, file_path, file_size, is_primary)
       VALUES (?, ?, ?, ?, 1)`,
      [studentProfileId, req.file.originalname, `resumes/${req.file.filename}`, req.file.size]
    );

    res.status(201).json({ success: true, message: 'Resume uploaded', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// GET /api/profile/resume/:id/download  (owner student or recruiter who received an application with this resume)
async function downloadResume(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, sp.user_id AS student_user_id FROM resumes r
       JOIN student_profiles sp ON sp.id = r.student_profile_id WHERE r.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) throw new AppError('Resume not found.', 404);
    const resume = rows[0];

    const isOwner = resume.student_user_id === req.user.id;
    let isAuthorizedRecruiter = false;
    if (req.user.role === 'recruiter') {
      const [appRows] = await pool.query(
        `SELECT a.id FROM applications a JOIN jobs j ON j.id = a.job_id
         WHERE a.resume_id = ? AND j.posted_by = ?`,
        [resume.id, req.user.id]
      );
      isAuthorizedRecruiter = appRows.length > 0;
    }

    if (!isOwner && !isAuthorizedRecruiter && req.user.role !== 'admin') {
      throw new AppError('Not authorized to download this resume.', 403);
    }

    const filePath = path.join(__dirname, '..', 'uploads', resume.file_path.replace('resumes/', 'resumes/'));
    if (!fs.existsSync(filePath)) throw new AppError('File not found on server.', 404);

    res.download(filePath, resume.file_name);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile, updateProfile, addSkill, removeSkill,
  addEducation, addExperience, uploadResume, downloadResume
};
