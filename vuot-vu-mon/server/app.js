const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security headers - với CSP cho phép inline scripts từ Vite
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development with Vite
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================
// STATIC FILES (Production)
// ============================================

// Serve static files from client/dist in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDistPath));
  console.log('📁 Serving static files from:', clientDistPath);
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', require('./routes/api'));

// ============================================
// SPA FALLBACK (Production)
// ============================================

// Serve index.html for all non-API routes in production (SPA fallback)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // If the request is for an API endpoint, continue to next middleware
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    // Otherwise, serve the index.html file (SPA fallback)
    const clientDistPath = path.join(__dirname, '..', 'client', 'dist', 'index.html');
    res.sendFile(clientDistPath);
  });
} else {
  // 404 handler for non-production
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });
  });
}

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
