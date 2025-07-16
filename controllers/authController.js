const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const { getDefaultRank } = require('../utils/rankHelper');

// Login
const login = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'E-posta ve şifre zorunludur');
    }

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      throw new ApiError(401, 'Geçersiz e-posta veya şifre');
    }
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Geçersiz e-posta veya şifre');
    }

    if (user.user_type !== userType) {
      throw new ApiError(403, 'Bu kullanıcı bu panel için yetkili değil');
    }

    const token = jwt.sign(
      { id: user.id, userType: user.user_type, rank: user.rank },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
        specialization: user.specialization,
        rank : user.rank
      }
      
    });

  } catch (error) {
    next(error);        // <‑‑ Global handler’a fırlatır
  }
};


// Register
const register = async (req, res, next) => {
  try {
    const { name, email, password, userType, specialization }  = req.body;
    const rank = getDefaultRank(specialization);

    const safeSpecialization = specialization ?? null;
    const safeRank = rank ?? null;


    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      throw new ApiError(400, 'User already exists');
    }



    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, user_type, specialization, `rank`) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, userType, safeSpecialization, safeRank]
    );

    // Get created user
    const [newUser] = await pool.execute(
      'SELECT id, name, email, user_type, specialization, `rank`, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0]
    });

  } catch (error) {
    next(error);
  }
};

// Forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new ApiError(404, 'User not found');
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
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Find valid reset token
    const [tokens] = await pool.execute(
      'SELECT email FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      throw new ApiError(400, 'Invalid or expired token');
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
    next(error);
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword
}; 