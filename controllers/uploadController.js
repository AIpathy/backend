const { pool } = require("../config/database");

const uploadTest = async (req, res) => {
  try {
    const filePath  = req.file?.path;
    const patientId = req.body.patientId;

    if (!filePath || !patientId) {
      return res.status(400).json({ message: "Dosya veya patientId eksik" });
    }

    await pool.execute(
      "INSERT INTO uploads (patient_id, file_path) VALUES (?, ?)",
      [patientId, filePath]
    );

    res.status(201).json({ message: "Yüklendi", filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = { uploadTest };
