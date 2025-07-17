const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT id, name, email, user_type, specialization, expertise_level, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert snake_case to camelCase
    const user = rows[0];
    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.user_type,
      specialization: user.specialization,
      expertiseLevel: user.expertise_level,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//  PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;                 
    const { name, email } = req.body;

    // Basit doğrulama
    if (!name && !email) {
      return res.status(400).json({ message: 'En az bir alan (name veya email) gönderin' });
    }

    // Değiştirmek istediğimiz alanları dinamik kur
    const fields = [];
    const values = [];

    if (name)  { fields.push('name = ?');  values.push(name);  }
    if (email) { fields.push('email = ?'); values.push(email); }

    values.push(userId);   // WHERE koşulu için

    // SQL güncelle
    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Güncel veriyi geri döndür
    const [rows] = await pool.execute(
      'SELECT id, name, email, user_type, specialization, expertise_level, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Convert snake_case to camelCase
    const user = rows[0];
    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.user_type,
      specialization: user.specialization,
      expertiseLevel: user.expertise_level,
      createdAt: user.created_at
    };

    res.json({ message: 'Profil güncellendi', user: response });

  } catch (error) {
    console.error('Update profile error:', error);
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

// update password
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mevcut ve yeni şifre gerekli.' });
    }

    
    const [rows] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const passwordHash = rows[0].password;

    
    const isMatch = await bcrypt.compare(currentPassword, passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mevcut şifre hatalı.' });
    }

    
    const newHash = await bcrypt.hash(newPassword, 10);

    
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newHash, userId]
    );

    return res.json({ message: 'Şifre güncellendi.' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  updatePassword
};