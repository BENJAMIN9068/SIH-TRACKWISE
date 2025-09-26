const express = require('express');
const router = express.Router();
const StaffUser = require('../models/StaffUser');

// Simple seed endpoint - remove this in production
router.post('/conductors', async (req, res) => {
  try {
    const conductorData = [
      {
        conductorId: 'BCS2024100',
        password: '1234567',
        name: 'Test Conductor 1',
        username: 'bcs2024100',
        email: 'bcs2024100@bustransport.com',
        phone: '9000000001',
        role: 'conductor'
      },
      {
        conductorId: 'BCS2024101',
        password: '1234567',
        name: 'Test Conductor 2',
        username: 'bcs2024101',
        email: 'bcs2024101@bustransport.com',
        phone: '9000000002',
        role: 'conductor'
      },
      {
        conductorId: 'TEST001',
        password: 'test123',
        name: 'Simple Test',
        username: 'test001',
        email: 'test001@bustransport.com',
        phone: '9000000999',
        role: 'conductor'
      }
    ];

    // Clear existing conductors
    await StaffUser.deleteMany({ role: 'conductor' });
    console.log('Cleared existing conductors');

    // Create new conductors
    const created = [];
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
      created.push({
        id: conductor.conductorId,
        name: conductor.name,
        password: conductor.password
      });
      console.log(`Created conductor: ${conductor.conductorId}`);
    }

    res.json({ 
      success: true, 
      message: `Successfully created ${created.length} conductors`,
      conductors: created
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;