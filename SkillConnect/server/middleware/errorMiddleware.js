// Catches requests to undefined routes
function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// Central error handler - every controller forwards errors here via next(err)
function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Custom error class for controlled throws, e.g. throw new AppError('Not found', 404)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { notFound, errorHandler, AppError };
