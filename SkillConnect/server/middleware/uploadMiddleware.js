const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('./errorMiddleware');

// Secure, collision-free filenames: <timestamp>-<random>-<original-ext>
function makeFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const random = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${random}${ext}`;
}

function buildStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', subfolder)),
    filename: (req, file, cb) => cb(null, makeFileName(file.originalname))
  });
}

const RESUME_TYPES = ['.pdf', '.doc', '.docx'];
const IMAGE_TYPES = ['.png', '.jpg', '.jpeg', '.webp'];

function fileFilterFactory(allowedExts) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new AppError(`Invalid file type. Allowed: ${allowedExts.join(', ')}`, 400));
    }
    cb(null, true);
  };
}

const uploadResume = multer({
  storage: buildStorage('resumes'),
  fileFilter: fileFilterFactory(RESUME_TYPES),
  limits: { fileSize: (Number(process.env.MAX_RESUME_SIZE_MB) || 5) * 1024 * 1024 }
});

const uploadLogo = multer({
  storage: buildStorage('logos'),
  fileFilter: fileFilterFactory(IMAGE_TYPES),
  limits: { fileSize: (Number(process.env.MAX_LOGO_SIZE_MB) || 2) * 1024 * 1024 }
});

module.exports = { uploadResume, uploadLogo };
