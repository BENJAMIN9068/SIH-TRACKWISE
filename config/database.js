const mongoose = require('mongoose');

// MongoDB Atlas connection configuration for production
const connectDB = async () => {
  try {
    // Connection string format for MongoDB Atlas
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!MONGO_URI) {
      console.warn('⚠️ MongoDB URI not defined - running in mock mode for localhost testing');
      return { connection: { host: 'mock-localhost' } };
    }

    console.log('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Serverless/Vercel optimizations
      maxPoolSize: 1, // Limit pool size for serverless
      serverSelectionTimeoutMS: 10000, // Increase timeout for serverless cold starts
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed due to app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during MongoDB shutdown:', error);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // In production, we might want to exit the process if DB connection fails
    if (process.env.NODE_ENV === 'production') {
      console.error('💀 Exiting due to database connection failure in production');
      process.exit(1);
    } else {
      console.warn('⚠️ Running in development mode without MongoDB - some features may be limited');
      return { connection: { host: 'localhost-fallback' } };
    }
    
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    console.log('🏓 MongoDB ping successful');
    return true;
  } catch (error) {
    console.error('🚫 MongoDB ping failed:', error.message);
    return false;
  }
};

// Get database stats
const getDBStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      database: stats.db,
      collections: stats.collections,
      objects: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`
    };
  } catch (error) {
    console.error('Error getting database stats:', error.message);
    return null;
  }
};

module.exports = {
  connectDB,
  testConnection,
  getDBStats
};