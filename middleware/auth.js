const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [rows] = await pool.execute(
      'SELECT id, name, email, user_type, specialization, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = rows[0];
    
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const requireDoctor = (req, res, next) => {
  if (req.user.user_type !== 'doctor') {
    return res.status(403).json({ message: 'Doctor access required' });
  }
  next();
};

const requireUser = (req, res, next) => {
  if (req.user.user_type !== 'user') {
    return res.status(403).json({ message: 'User access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireDoctor,
  requireUser
}; 