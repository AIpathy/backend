const multer  = require("multer");
const path    = require("path");

// Depolama ayarı
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename   : (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});

// Basit dosya tip filtresi (isteğe bağlı)
const fileFilter = (req, file, cb) => {
  const allowed = /wav|mp3|mp4|jpg|jpeg|png|pdf|txt/;
  const ext     = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.test(ext));
};

module.exports = multer({ storage, fileFilter });
