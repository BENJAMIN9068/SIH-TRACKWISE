const mongoose = require('mongoose');

// Setup MongoDB memory server for testing
beforeAll(async () => {
  // Test database connection
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/bus-tracking-test';

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

afterAll(async () => {
  // Clean up test database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  // Clean collections before each test
  if (mongoose.connection.readyState === 1) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});
