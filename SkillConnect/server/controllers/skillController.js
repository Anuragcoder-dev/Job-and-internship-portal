const { pool } = require('../config/db');

// GET /api/skills?search=react
async function searchSkills(req, res, next) {
  try {
    const { search } = req.query;
    const [rows] = await pool.query(
      'SELECT id, name FROM skills WHERE name LIKE ? ORDER BY name LIMIT 20',
      [`%${search || ''}%`]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/skills/resolve  { names: ["React.js", "Node.js"] }
// Finds existing skills by name or creates them, returns [{id, name}]
async function resolveSkills(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { names = [] } = req.body;
    const resolved = [];

    await conn.beginTransaction();
    for (const rawName of names) {
      const name = rawName.trim();
      if (!name) continue;

      const [existing] = await conn.query('SELECT id, name FROM skills WHERE name = ?', [name]);
      if (existing.length > 0) {
        resolved.push(existing[0]);
      } else {
        const [result] = await conn.query('INSERT INTO skills (name) VALUES (?)', [name]);
        resolved.push({ id: result.insertId, name });
      }
    }
    await conn.commit();

    res.json({ success: true, data: resolved });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

module.exports = { searchSkills, resolveSkills };
