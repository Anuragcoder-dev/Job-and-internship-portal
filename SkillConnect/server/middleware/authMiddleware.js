const jwt = require('jsonwebtoken');
const { AppError } = require('./errorMiddleware');

// Verifies the JWT sent in the Authorization header ("Bearer <token>")
// and attaches the decoded payload to req.user
function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Not authorized. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded shape: { id, role, email }
    req.user = decoded;
    next();
  } catch (err) {
    next(new AppError('Not authorized. Invalid or expired token.', 401));
  }
}

module.exports = { protect };
