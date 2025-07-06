const { pool } = require('../config/database');

// Get user profile
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

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Update user
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(userId);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [updatedUser] = await pool.execute(
      'SELECT id, name, email, user_type, specialization, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get dashboard stats for users
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total analyses count
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