const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const alertRoutes = require('./routes/alerts');
require('dotenv').config();
const { testConnection } = require('./config/database');
const runMigrations = require('./config/runMigrations');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/analyses', require('./routes/analyses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/alerts', alertRoutes);
app.use('/api/migration', require('./routes/migration'));
app.use('/api/ml', require('./routes/ml'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AIpathy Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

(async () => {
  await testConnection();
  await runMigrations();
  const PORT = 80;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})(); 