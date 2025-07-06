const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Login
const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Get user from database
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND user_type = ?',
      [email, userType]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userType]
    );

    // Get created user
    const [newUser] = await pool.execute(
      'SELECT id, name, email, user_type, specialization, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await pool.execute(
      'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      [email, resetToken, expiresAt]
    );

    // Send email (in production, configure nodemailer)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find valid reset token
    const [tokens] = await pool.execute(
      'SELECT email FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const email = tokens[0].email;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    // Delete used token
    await pool.execute(
      'DELETE FROM password_reset_tokens WHERE token = ?',
      [token]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword
}; 