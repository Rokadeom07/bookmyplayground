const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { refreshVenueTrie } = require('./controllers/venueController');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'BookMyPlayground 2.0',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/venues', require('./routes/venueRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on BookMyPlayground server.`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    // Warm up the Trie with verified venue records
    await refreshVenueTrie();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 BookMyPlayground 2.0 Server Running on Port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🏙️  Indian Locations & 6 Sports Active`);
      console.log(`⚡ Smart Recommendation, Group Finder, Weather Ready`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start BookMyPlayground server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
