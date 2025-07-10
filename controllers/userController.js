const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT id, name, email, user_type, specialization, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//  PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, currentPassword } = req.body;

    // 1) E-posta çakışıyor mu kontrol et
    if (email) {
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // 2) Şifre değiştirilecekse önce doğrula
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required' });
      }

      const [rows] = await pool.execute(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );
      const user = rows[0];
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const hashed = await bcrypt.hash(password, 10);
      await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    }

    // İsim ve e-posta güncelle
    const fields = [];
    const values = [];

    if (name) {
      fields.push('name = ?');
      values.push(name);
    }

    if (email) {
      fields.push('email = ?');
      values.push(email);
    }

    if (fields.length > 0) {
      values.push(userId);
      await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    // Güncel kullanıcıyı geri döndür
    const [updated] = await pool.execute(
      'SELECT id, name, email, user_type, specialization, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updated[0]
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Kullanıcı istatistikleri 
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [analysesCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM analyses WHERE user_id = ?',
      [userId]
    );
    const [analysesByType] = await pool.execute(
      'SELECT type, COUNT(*) as count FROM analyses WHERE user_id = ? GROUP BY type',
      [userId]
    );
    const [recentAnalyses] = await pool.execute(
      'SELECT type, score, created_at FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    const [avgScore] = await pool.execute(
      'SELECT AVG(score) as average FROM analyses WHERE user_id = ? AND score IS NOT NULL',
      [userId]
    );

    res.json({
      totalAnalyses: analysesCount[0].total,
      analysesByType,
      recentAnalyses,
      averageScore: avgScore[0].average || 0
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats
};