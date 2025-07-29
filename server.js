const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const alertRoutes = require('./routes/alerts');
require('dotenv').config();

// Set NODE_ENV to production if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}
const { testConnection } = require('./config/database');
const runMigrations = require('./config/runMigrations');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://aipathy.xyz',
    'https://www.aipathy.xyz',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('/app/uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/analyses', require('./routes/analyses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/alerts', alertRoutes);
app.use('/api/migration', require('./routes/migration'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/ai', require('./routes/ai'));

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