const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const alertRoutes = require('./routes/alerts');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const ApiError = require('./utils/ApiError');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate-Limit
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/analyses', require('./routes/analyses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/alerts', alertRoutes);
app.use('/api/uploads', require('./routes/uploads'));


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AIpathy Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : 'Sunucu hatası';
  const details = err instanceof ApiError ? err.details : undefined;

  const errorResponse = { message };
  if (details) errorResponse.details = details;

  res.status(statusCode).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 