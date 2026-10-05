require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Normal server (local / Render): connect once at startup.
// Vercel (serverless): connection is made per request below.
if (!process.env.VERCEL) connectDB();

// Behind Render's proxy: needed so rate limiting sees the real client IP
app.set('trust proxy', 1);

// CORS: local dev origins + deployed frontend(s) from FRONTEND_URL (comma-separated)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean),
];

app.use(cors({
  origin: (origin, callback) => {
    // allow tools like curl/health checks (no Origin header) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Health check (works even if the database is down)
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BudgetFlow API is running', timestamp: new Date().toISOString() });
});

// Serverless: make sure the database is connected before handling a request
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: 'Database connection failed' });
    }
  });
}

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/calendar', require('./routes/calendar'));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Vercel runs the exported app itself; only listen on a port for local/Render
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 BudgetFlow API running on port ${PORT}`);
  });
}

module.exports = app;
