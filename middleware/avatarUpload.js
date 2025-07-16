const multer = require('multer');
const path   = require('path');

// Depolama →  /backend/uploads/avatars
const storage = multer.diskStorage({
  destination: (_req, _file, cb) =>
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user-${req.user.id}_${Date.now()}${ext}`);
  }
});

// Yalnızca resim dosyaları
const fileFilter = (_req, file, cb) => {
  cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
