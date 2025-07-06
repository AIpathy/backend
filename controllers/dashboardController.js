const { pool } = require('../config/database');

// Get doctor dashboard stats
const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Get total patients
    const [patientCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM patients WHERE doctor_id = ?',
      [doctorId]
    );

    // Get patients by status
    const [patientsByStatus] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM patients WHERE doctor_id = ? GROUP BY status',
      [doctorId]
    );

    // Get patients by risk level
    const [patientsByRisk] = await pool.execute(
      'SELECT risk_level, COUNT(*) as count FROM patients WHERE doctor_id = ? GROUP BY risk_level',
      [doctorId]
    );

    // Get recent activities
    const [recentActivities] = await pool.execute(
      `SELECT 
        p.name as patient_name,
        a.type,
        a.score,
        a.created_at
      FROM analyses a
      JOIN patients p ON a.patient_id = p.id
      WHERE p.doctor_id = ?
      ORDER BY a.created_at DESC
      LIMIT 10`,
      [doctorId]
    );

    // Get alerts count
    const [alertsCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM alerts a
       JOIN patients p ON a.patient_id = p.id
       WHERE p.doctor_id = ? AND a.is_read = FALSE`,
      [doctorId]
    );

    res.json({
      totalPatients: patientCount[0].total,
      patientsByStatus,
      patientsByRisk,
      recentActivities,
      unreadAlerts: alertsCount[0].total
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user dashboard stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total analyses
    const [analysesCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM analyses WHERE user_id = ?',
      [userId]
    );

    // Get analyses by type
    const [analysesByType] = await pool.execute(
      'SELECT type, COUNT(*) as count FROM analyses WHERE user_id = ? GROUP BY type',
      [userId]
    );

    // Get recent analyses
    const [recentAnalyses] = await pool.execute(
      'SELECT type, score, created_at FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    // Calculate average score
    const [avgScore] = await pool.execute(
      'SELECT AVG(score) as average FROM analyses WHERE user_id = ? AND score IS NOT NULL',
      [userId]
    );

    // Get trend (compare last 7 days with previous 7 days)
    const [trendData] = await pool.execute(
      `SELECT 
        AVG(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN score END) as recent_avg,
        AVG(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) THEN score END) as previous_avg
      FROM analyses 
      WHERE user_id = ? AND score IS NOT NULL`,
      [userId]
    );

    const trend = trendData[0].recent_avg && trendData[0].previous_avg 
      ? trendData[0].recent_avg - trendData[0].previous_avg 
      : 0;

    res.json({
      totalAnalyses: analysesCount[0].total,
      analysesByType,
      recentAnalyses,
      averageScore: avgScore[0].average || 0,
      trend: trend
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get alerts for doctors
const getAlerts = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const [alerts] = await pool.execute(
      `SELECT 
        a.id,
        a.type,
        a.message,
        a.is_read,
        a.created_at,
        p.name as patient_name,
        p.email as patient_email
      FROM alerts a
      JOIN patients p ON a.patient_id = p.id
      WHERE p.doctor_id = ?
      ORDER BY a.created_at DESC`,
      [doctorId]
    );

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark alert as read
const markAlertAsRead = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const alertId = req.params.id;

    // Verify alert belongs to doctor's patient
    const [alerts] = await pool.execute(
      `SELECT a.id FROM alerts a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.id = ? AND p.doctor_id = ?`,
      [alertId, doctorId]
    );

    if (alerts.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await pool.execute(
      'UPDATE alerts SET is_read = TRUE WHERE id = ?',
      [alertId]
    );

    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDoctorStats,
  getUserStats,
  getAlerts,
  markAlertAsRead
}; 