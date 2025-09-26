const express = require('express');
const router = express.Router();
const Journey = require('../models/Journey');
const StaffUser = require('../models/StaffUser');
const PublicUser = require('../models/PublicUser');
const StaffPasswordReset = require('../models/StaffPasswordReset');
const PublicPasswordReset = require('../models/PublicPasswordReset');

// Middleware to check if admin is logged in
const requireAdminAuth = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.redirect('/admin');
  }
  next();
};

// Admin login page
router.get('/', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login');
});

// Admin dashboard
router.get('/dashboard', requireAdminAuth, async (req, res) => {
  try {
    const runningBuses = await Journey.countDocuments({ status: 'running' });
    const startingBuses = await Journey.countDocuments({ status: 'starting' });
    const completedJourneys = await Journey.countDocuments({ status: 'completed' });
    const totalStaff = await StaffUser.countDocuments({ isActive: true });
    const totalPublicUsers = await PublicUser.countDocuments({ isActive: true });

    const recentJourneys = await Journey.find()
      .populate('staffUser')
      .sort({ startedAt: -1 })
      .limit(10);

    res.render('admin/dashboard', {
      stats: {
        runningBuses,
        startingBuses,
        completedJourneys,
        totalStaff,
        totalPublicUsers,
      },
      recentJourneys,
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// Live buses page
router.get('/live-buses', requireAdminAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    let liveBuses = [];
    
    if (isDbConnected) {
      // Database connected - use real data
      try {
        liveBuses = await Journey.find({
          status: { $in: ['starting', 'running'] },
        })
          .populate('staffUser')
          .select('busNumber startingPoint destination route highway currentLocation status depot startedAt seatInfo staffUser driverName conductorName')
          .sort({ startedAt: -1 });
      } catch (dbError) {
        console.log('Database query failed, using demo data');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - use demo data
      liveBuses = demoData.findJourneys({ status: { $in: ['starting', 'running'] } })
        .map(journey => ({
          ...journey,
          staffUser: demoData.findStaffUser({ _id: journey.staffUser })
        }))
        .sort((a, b) => b.startedAt - a.startedAt);
    }

    res.render('admin/live-buses', { 
      liveBuses,
      isDemo: !isDbConnected 
    });
  } catch (error) {
    console.error('Live buses error:', error);
    res.render('admin/live-buses', { 
      liveBuses: [],
      isDemo: true,
      error: 'Demo mode - showing sample data'
    });
  }
});

// Staff database page
router.get('/staff-db', requireAdminAuth, async (req, res) => {
  try {
    const staffUsers = await StaffUser.find().sort({ createdAt: -1 });
    res.render('admin/staff-db', { staffUsers });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// Public database page
router.get('/public-db', requireAdminAuth, async (req, res) => {
  try {
    const publicUsers = await PublicUser.find().sort({ createdAt: -1 });
    res.render('admin/public-db', { publicUsers });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// Buses running map page
router.get('/buses-running', requireAdminAuth, async (req, res) => {
  try {
    const allRunningBuses = await Journey.find({
      status: { $in: ['starting', 'running'] },
    })
      .populate('staffUser')
      .select('busNumber startingPoint destination route highway currentLocation status depot startedAt seatInfo staffUser driverName conductorName');

    // Filter out buses with invalid coordinates
    const runningBuses = allRunningBuses.filter(bus => {
      if (!bus.currentLocation || !bus.currentLocation.coordinates) {
        return false;
      }
      const [lng, lat] = bus.currentLocation.coordinates;
      return lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat) && Math.abs(lng) > 0.1 && Math.abs(lat) > 0.1;
    });

    console.log(`Found ${allRunningBuses.length} total buses, ${runningBuses.length} with valid GPS`);
    res.render('admin/buses-map', { runningBuses });
  } catch (error) {
    console.error('Buses map error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// API to get journey details
router.get('/api/journey/:id', requireAdminAuth, async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id).populate('staffUser');
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }
    res.json({ journey });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API to get live bus locations
router.get('/api/live-locations', requireAdminAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    let liveBuses = [];
    
    if (isDbConnected) {
      // Database connected - use real data
      try {
        liveBuses = await Journey.find({
          status: { $in: ['starting', 'running'] },
          'currentLocation.coordinates': { $exists: true, $ne: null },
        })
          .populate('staffUser')
          .select('busNumber startingPoint destination currentLocation status route highway driverName conductorName path seatInfo');
      } catch (dbError) {
        console.log('Database query failed, using demo data');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - use demo data
      liveBuses = demoData.findJourneys({ status: { $in: ['starting', 'running'] } })
        .filter(journey => journey.currentLocation && journey.currentLocation.coordinates)
        .map(journey => ({
          ...journey,
          staffUser: demoData.findStaffUser({ _id: journey.staffUser })
        }));
    }

    // Filter out buses with invalid coordinates (0,0 or null)
    const validBuses = liveBuses.filter(bus => {
      if (!bus.currentLocation || !bus.currentLocation.coordinates) {
        return false;
      }
      const [lng, lat] = bus.currentLocation.coordinates;
      return lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat) && Math.abs(lng) > 0.1 && Math.abs(lat) > 0.1;
    });

    res.json({ 
      buses: validBuses,
      totalCount: liveBuses.length,
      validCount: validBuses.length,
      isDemo: !isDbConnected
    });
  } catch (error) {
    console.error('Live locations API error:', error);
    res.json({ 
      buses: [],
      totalCount: 0,
      validCount: 0,
      isDemo: true
    });
  }
});

// Update journey status (admin can override)
router.post('/journey/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const journey = await Journey.findByIdAndUpdate(
      req.params.id,
      { status, completedAt: status === 'completed' ? new Date() : null },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    res.json({ success: true, journey });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Staff password reset requests page
router.get('/staff-password-requests', requireAdminAuth, async (req, res) => {
  try {
    const passwordRequests = await StaffPasswordReset.find().sort({ requestedAt: -1 });
    res.render('admin/staff-password-requests', { passwordRequests });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// Public password reset requests page
router.get('/public-password-requests', requireAdminAuth, async (req, res) => {
  try {
    const passwordRequests = await PublicPasswordReset.find().sort({ requestedAt: -1 });
    res.render('admin/public-password-requests', { passwordRequests });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// Process staff password reset
router.post('/process-staff-password-reset/:id', requireAdminAuth, async (req, res) => {
  try {
    const { action, notes } = req.body;
    const request = await StaffPasswordReset.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (action === 'approve') {
      // Generate new password
      const newPassword = Math.random().toString(36).slice(-8);
      
      // Update staff user password
      const staffUser = await StaffUser.findOne({ employeeId: request.conductorId });
      if (staffUser) {
        staffUser.password = newPassword;
        await staffUser.save();
      }
      
      // Update request status
      request.status = 'approved';
      request.processedAt = new Date();
      request.processedBy = 'admin';
      request.newPassword = newPassword;
      request.notes = notes;
      await request.save();
      
      res.json({ 
        success: true, 
        message: `Password reset approved. New password: ${newPassword}`,
        newPassword 
      });
    } else {
      // Reject request
      request.status = 'rejected';
      request.processedAt = new Date();
      request.processedBy = 'admin';
      request.notes = notes;
      await request.save();
      
      res.json({ success: true, message: 'Password reset request rejected.' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Process public password reset
router.post('/process-public-password-reset/:id', requireAdminAuth, async (req, res) => {
  try {
    const { action, notes } = req.body;
    const request = await PublicPasswordReset.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (action === 'approve') {
      // Generate new password
      const newPassword = Math.random().toString(36).slice(-8);
      
      // Update public user password
      const publicUser = await PublicUser.findOne({ 
        username: request.username,
        email: request.email 
      });
      if (publicUser) {
        publicUser.password = newPassword;
        await publicUser.save();
      }
      
      // Update request status
      request.status = 'approved';
      request.processedAt = new Date();
      request.processedBy = 'admin';
      request.newPassword = newPassword;
      request.notes = notes;
      await request.save();
      
      res.json({ 
        success: true, 
        message: `Password reset approved. New password has been sent to ${request.email}`,
        newPassword 
      });
    } else {
      // Reject request
      request.status = 'rejected';
      request.processedAt = new Date();
      request.processedBy = 'admin';
      request.notes = notes;
      await request.save();
      
      res.json({ success: true, message: 'Password reset request rejected.' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
