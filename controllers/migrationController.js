const { pool } = require('../config/database');

// Migration: Add expertise_level column
const addExpertiseLevelColumn = async (req, res) => {
  try {
    // Check if column already exists
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aipathy' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'expertise_level'"
    );

    if (columns.length > 0) {
      return res.json({ message: 'expertise_level column already exists' });
    }

    // Add the column
    await pool.execute(
      'ALTER TABLE users ADD COLUMN expertise_level VARCHAR(255) NULL AFTER specialization'
    );

    // Mevcut doktor kayıtlarını güvenli bir şekilde güncelle
    await pool.execute(
      "UPDATE users SET expertise_level = 'Uzman Psikiyatrist' WHERE user_type = 'doctor' AND specialization = 'Psikiyatri' AND expertise_level IS NULL"
    );
    
    await pool.execute(
      "UPDATE users SET expertise_level = 'Klinik Psikolog' WHERE user_type = 'doctor' AND specialization = 'Psikoloji' AND expertise_level IS NULL"
    );
    
    // Eğer specialization boşsa varsayılan değer
    await pool.execute(
      "UPDATE users SET expertise_level = 'Doktor' WHERE user_type = 'doctor' AND (specialization IS NULL OR specialization = '') AND expertise_level IS NULL"
    );
    
    // Diğer specialization'lar için genel bir değer
    await pool.execute(
      "UPDATE users SET expertise_level = 'Uzman' WHERE user_type = 'doctor' AND specialization NOT IN ('Psikiyatri', 'Psikoloji') AND expertise_level IS NULL"
    );

    res.json({ message: 'Migration completed successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
};

module.exports = {
  addExpertiseLevelColumn
}; 