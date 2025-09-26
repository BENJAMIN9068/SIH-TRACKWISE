const mongoose = require('mongoose');
const StaffUser = require('../models/StaffUser');
require('dotenv').config();

const conductorData = [
  {
    conductorId: 'BCS2024100',
    password: '1234567',
    name: 'Conductor 1',
    username: 'bcs2024100',
    email: 'bcs2024100@bustransport.com',
    phone: '9000000001',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024101',
    password: '1234567',
    name: 'Conductor 2',
    username: 'bcs2024101',
    email: 'bcs2024101@bustransport.com',
    phone: '9000000002',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024102',
    password: '234568',
    name: 'Conductor 3',
    username: 'bcs2024102',
    email: 'bcs2024102@bustransport.com',
    phone: '9000000003',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024103',
    password: '345678',
    name: 'Conductor 4',
    username: 'bcs2024103',
    email: 'bcs2024103@bustransport.com',
    phone: '9000000004',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024104',
    password: '456789',
    name: 'Conductor 5',
    username: 'bcs2024104',
    email: 'bcs2024104@bustransport.com',
    phone: '9000000005',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024105',
    password: '567890',
    name: 'Conductor 6',
    username: 'bcs2024105',
    email: 'bcs2024105@bustransport.com',
    phone: '9000000006',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024106',
    password: '678901',
    name: 'Conductor 7',
    username: 'bcs2024106',
    email: 'bcs2024106@bustransport.com',
    phone: '9000000007',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024107',
    password: '789012',
    name: 'Conductor 8',
    username: 'bcs2024107',
    email: 'bcs2024107@bustransport.com',
    phone: '9000000008',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024108',
    password: '890123',
    name: 'Conductor 9',
    username: 'bcs2024108',
    email: 'bcs2024108@bustransport.com',
    phone: '9000000009',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024109',
    password: '901234',
    name: 'Conductor 10',
    username: 'bcs2024109',
    email: 'bcs2024109@bustransport.com',
    phone: '9000000010',
    role: 'conductor'
  },
  {
    conductorId: 'BCS2024110',
    password: '012345',
    name: 'Conductor 11',
    username: 'bcs2024110',
    email: 'bcs2024110@bustransport.com',
    phone: '9000000011',
    role: 'conductor'
  }
];

async function seedConductors() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bus-tracking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing conductor data
    await StaffUser.deleteMany({ role: 'conductor' });
    console.log('Cleared existing conductor data');

    // Insert new conductor data one by one to trigger password hashing
    for (const conductor of conductorData) {
      const staffUser = new StaffUser({
        username: conductor.username,
        email: conductor.email,
        password: conductor.password,
        employeeId: conductor.conductorId,
        name: conductor.name,
        phone: conductor.phone,
        role: conductor.role,
        isActive: true
      });
      
      await staffUser.save();
      console.log(`Created conductor: ${conductor.conductorId} - ${conductor.name}`);
    }

    console.log(`Successfully seeded ${conductorData.length} conductors`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding conductors:', error);
    mongoose.connection.close();
  }
}

// Run the seeder
if (require.main === module) {
  seedConductors();
}

module.exports = { seedConductors, conductorData };