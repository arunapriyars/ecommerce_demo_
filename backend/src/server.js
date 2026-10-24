require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./config/db');
const { initSchema } = require('./database/schema');
const { seed } = require('./database/seed');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize database schema and verify seed
initSchema();
try {
  const productCount = db.get('SELECT COUNT(*) as count FROM products')?.count || 0;
  if (productCount === 0) {
    console.log('Database empty! Auto-seeding initial products and demo accounts...');
    seed();
  }
} catch (e) {
  console.log('Database check notice:', e.message);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/vibes', require('./routes/vibeRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'VibeCart API',
    tagline: 'Your mood. Your style. Your vibe.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found on VibeCart server.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`✨ VibeCart API Server running at http://localhost:${PORT}`);
  console.log(`✨ Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✨ API Health: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = { app, server };
