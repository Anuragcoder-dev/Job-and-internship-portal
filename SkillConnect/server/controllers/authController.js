const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/tokenUtil');
const { AppError } = require('../middleware/errorMiddleware');

const SALT_ROUNDS = 10;

// POST /api/auth/register
async function register(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { name, email, password, role, phone } = req.body;

    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw new AppError('Email is already registered.', 409);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, phone || null]
    );
    const userId = result.insertId;

    if (role === 'student') {
      await conn.query('INSERT INTO student_profiles (user_id) VALUES (?)', [userId]);
    } else if (role === 'recruiter') {
      await conn.query('INSERT INTO recruiter_profiles (user_id) VALUES (?)', [userId]);
    }

    await conn.commit();

    const user = { id: userId, name, email, role };
    const token = generateToken(user);

    res.status(201).json({ success: true, message: 'Registration successful', data: { user, token } });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) throw new AppError('Invalid email or password.', 401);

    const user = rows[0];

    if (!user.is_active) throw new AppError('Your account has been disabled. Contact support.', 403);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new AppError('Invalid email or password.', 401);

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
// Stateless JWT: logout is handled client-side by discarding the token.
// This endpoint exists for a consistent API surface and future token blacklisting.
async function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully' });
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    // Always respond generically to avoid leaking which emails exist
    if (rows.length === 0) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expires, rows[0].id]
    );

    // In production this would be emailed via a mail service (e.g. SendGrid/SES).
    // Returned here only for local/dev testing convenience.
    res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && { devResetToken: resetToken })
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    if (rows.length === 0) throw new AppError('Reset token is invalid or has expired.', 400);

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [passwordHash, rows[0].id]
    );

    res.json({ success: true, message: 'Password has been reset. Please log in.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getCurrentUser(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, is_active, is_verified, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) throw new AppError('User not found.', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, forgotPassword, resetPassword, getCurrentUser };
