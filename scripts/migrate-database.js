#!/usr/bin/env node

/**
 * Database Migration Script for TrackWise
 * Handles first-time setup and data migration for cPanel deployment
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const StaffUser = require('../models/StaffUser');
const PublicUser = require('../models/PublicUser');
const Journey = require('../models/Journey');

console.log('🚀 Starting TrackWise Database Migration...\n');

async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function createAdminUser() {
  try {
    console.log('\n👤 Creating admin user...');
    
    const bcrypt = require('bcryptjs');
    const adminExists = await StaffUser.findOne({ 
      $or: [
        { employee_id: process.env.ADMIN_ID || 'admin' },
        { email: 'admin@trackwise.com' }
      ]
    });

    if (adminExists) {
      console.log('⚠️  Admin user already exists, skipping creation');
      return true;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS || 'admin123', 10);
    
    const adminUser = new StaffUser({
      employee_id: process.env.ADMIN_ID || 'admin',
      name: 'System Administrator',
      email: 'admin@trackwise.com',
      password: hashedPassword,
      role: 'conductor', // Using conductor role with admin privileges
      phone: '1234567890',
      depot: 'Main Office',
      status: 'active'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log(`   Username: ${adminUser.employee_id}`);
    console.log(`   Email: ${adminUser.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    return false;
  }
}

async function createSampleData() {
  try {
    console.log('\n📊 Creating sample data...');

    // Check if sample conductor exists
    const sampleConductor = await StaffUser.findOne({ employee_id: 'COND001' });
    
    if (!sampleConductor) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('conductor123', 10);
      
      const conductor = new StaffUser({
        employee_id: 'COND001',
        name: 'John Conductor',
        email: 'conductor@trackwise.com',
        password: hashedPassword,
        role: 'conductor',
        phone: '9876543210',
        depot: 'Central Depot',
        status: 'active'
      });
      
      await conductor.save();
      console.log('✅ Sample conductor created');
    } else {
      console.log('⚠️  Sample conductor already exists, skipping');
    }

    // Check if sample driver exists
    const sampleDriver = await StaffUser.findOne({ employee_id: 'DRV001' });
    
    if (!sampleDriver) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('driver123', 10);
      
      const driver = new StaffUser({
        employee_id: 'DRV001',
        name: 'Mike Driver',
        email: 'driver@trackwise.com',
        password: hashedPassword,
        role: 'driver',
        phone: '9876543211',
        depot: 'Central Depot',
        status: 'active'
      });
      
      await driver.save();
      console.log('✅ Sample driver created');
    } else {
      console.log('⚠️  Sample driver already exists, skipping');
    }

    return true;
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
    return false;
  }
}

async function createIndexes() {
  try {
    console.log('\n🗂️  Creating database indexes for performance...');

    // Index for staff users
    await StaffUser.collection.createIndex({ employee_id: 1 }, { unique: true });
    await StaffUser.collection.createIndex({ email: 1 }, { unique: true });
    
    // Index for public users
    await PublicUser.collection.createIndex({ email: 1 }, { unique: true });
    
    // Index for journeys
    await Journey.collection.createIndex({ staff_id: 1 });
    await Journey.collection.createIndex({ bus_number: 1 });
    await Journey.collection.createIndex({ status: 1 });
    await Journey.collection.createIndex({ start_time: -1 });

    console.log('✅ Database indexes created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    return false;
  }
}

async function verifySetup() {
  try {
    console.log('\n🔍 Verifying database setup...');
    
    const staffCount = await StaffUser.countDocuments();
    const publicCount = await PublicUser.countDocuments();
    const journeyCount = await Journey.countDocuments();
    
    console.log(`   📊 Staff Users: ${staffCount}`);
    console.log(`   📊 Public Users: ${publicCount}`);
    console.log(`   📊 Journeys: ${journeyCount}`);
    
    if (staffCount === 0) {
      console.log('⚠️  Warning: No staff users found. Admin user creation may have failed.');
      return false;
    }
    
    console.log('✅ Database verification completed');
    return true;
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    return false;
  }
}

async function main() {
  let success = true;
  
  try {
    // Connect to database
    const connected = await connectDatabase();
    if (!connected) {
      process.exit(1);
    }

    // Create admin user
    const adminCreated = await createAdminUser();
    if (!adminCreated) {
      success = false;
    }

    // Create sample data
    const sampleCreated = await createSampleData();
    if (!sampleCreated) {
      success = false;
    }

    // Create indexes
    const indexesCreated = await createIndexes();
    if (!indexesCreated) {
      success = false;
    }

    // Verify setup
    const verified = await verifySetup();
    if (!verified) {
      success = false;
    }

    if (success) {
      console.log('\n🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('\n📋 Next Steps:');
      console.log('1. Start your cPanel Node.js application');
      console.log('2. Access admin panel: https://yourdomain.com/auth/admin/login');
      console.log('3. Login with admin credentials');
      console.log('4. Configure your bus routes and staff');
      console.log('\n🔑 Admin Credentials:');
      console.log(`   Username: ${process.env.ADMIN_ID || 'admin'}`);
      console.log(`   Password: ${process.env.ADMIN_PASS || 'admin123'}`);
      console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please check the logs above.');
    }

  } catch (error) {
    console.error('\n💥 Migration failed with error:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔐 Database connection closed');
    }
    
    process.exit(success ? 0 : 1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run migration
main();