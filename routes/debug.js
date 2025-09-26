const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Debug endpoint to test MongoDB connection
router.get('/connection-test', async (req, res) => {
  try {
    // Check if mongoose is connected
    const mongooseState = mongoose.connection.readyState;
    const stateNames = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const connectionInfo = {
      mongooseState: stateNames[mongooseState] || 'unknown',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port,
      mongoUri: process.env.MONGO_URI ? 'SET' : 'NOT SET',
      mongoUriFormat: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 50) + '...' : 'NOT SET'
    };

    // Try to ping the database
    if (mongooseState === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        connectionInfo.pingResult = 'SUCCESS';
      } catch (pingError) {
        connectionInfo.pingResult = 'FAILED';
        connectionInfo.pingError = pingError.message;
      }
    } else {
      connectionInfo.pingResult = 'SKIPPED (not connected)';
    }

    // Environment info
    connectionInfo.environment = {
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      vercel: process.env.VERCEL ? 'YES' : 'NO'
    };

    res.json({
      success: mongooseState === 1,
      connection: connectionInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Environment variables check
router.get('/env-check', (req, res) => {
  const envCheck = {
    MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET',
    SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT SET',
    ADMIN_ID: process.env.ADMIN_ID ? 'SET' : 'NOT SET',
    ADMIN_PASS: process.env.ADMIN_PASS ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    VERCEL: process.env.VERCEL ? 'YES' : 'NO'
  };

  // Show first and last few characters of MONGO_URI for debugging
  if (process.env.MONGO_URI) {
    const uri = process.env.MONGO_URI;
    envCheck.MONGO_URI_PREVIEW = uri.substring(0, 20) + '...' + uri.substring(uri.length - 20);
    envCheck.MONGO_URI_INCLUDES_DATABASE = uri.includes('/bus-tracking') ? 'YES' : 'NO';
    envCheck.MONGO_URI_FORMAT_CHECK = {
      startsWithMongodb: uri.startsWith('mongodb+srv://') ? 'YES' : 'NO',
      includesMongodbNet: uri.includes('mongodb.net') ? 'YES' : 'NO',
      includesDatabaseName: uri.includes('/bus-tracking') ? 'YES' : 'NO',
      includesRetryWrites: uri.includes('retryWrites=true') ? 'YES' : 'NO'
    };
  }

  res.json({
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
});

// Simple health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Debug routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;