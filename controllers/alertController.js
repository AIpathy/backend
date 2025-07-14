const { pool } = require('../config/database');

// Tüm uyarılar
exports.getAlerts = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT alerts.*
       FROM alerts
       JOIN patients ON alerts.patient_id = patients.id
       WHERE patients.doctor_id = ?
       ORDER BY alerts.created_at DESC`,
      [doctorId]
    );
    res.json(rows);
  } catch (err) {
    console.error('getAlerts error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tek uyarı okundu
exports.markAlertAsRead = async (req, res) => {
  try {
    await pool.execute('UPDATE alerts SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Uyarı okundu olarak işaretlendi.' });
  } catch (err) {
    console.error('markAlertAsRead error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tüm uyarılar okundu
exports.markAllAsRead = async (req, res) => {
  try {
    const doctorId = req.user.id;
    await pool.execute(
      `UPDATE alerts
       JOIN patients ON alerts.patient_id = patients.id
       SET alerts.is_read = 1
       WHERE patients.doctor_id = ?`,
      [doctorId]
    );
    res.json({ message: 'Tüm uyarılar okundu olarak işaretlendi.' });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Uyarı silindi
exports.deleteAlert = async (req, res) => {
  try {
    const alertId  = req.params.id;
    const doctorId = req.user.id;               

    // Sadece bu doktora ait hastanın uyarısını sil
    await pool.execute(
      `DELETE alerts FROM alerts
       JOIN patients ON alerts.patient_id = patients.id
       WHERE alerts.id = ? AND patients.doctor_id = ?`,
      [alertId, doctorId]
    );

    res.json({ message: 'Uyarı silindi' });
  } catch (error) {
    console.error('deleteAlert error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tüm uyarılar silindi
exports.deleteAllAlerts = async (req, res) => {
  try {
    const doctorId = req.user.id;

    await pool.execute(`
      DELETE alerts FROM alerts
      JOIN patients ON alerts.patient_id = patients.id
      WHERE patients.doctor_id = ?`,
      [doctorId]
    );

    res.json({ message: 'Tüm uyarılar silindi' });
  } catch (error) {
    console.error('deleteAllAlerts error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const { id }   = req.params;
    const doctorId = req.user.id;

    const [rows] = await pool.execute(`
      SELECT alerts.*, patients.name AS patient_name
      FROM alerts
      JOIN patients ON alerts.patient_id = patients.id
      WHERE alerts.id = ? AND patients.doctor_id = ?
      LIMIT 1
    `, [id, doctorId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Uyarı bulunamadı' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('getAlertById error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

