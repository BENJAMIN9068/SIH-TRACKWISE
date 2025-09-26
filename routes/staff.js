const express = require('express');
const router = express.Router();
const StaffUser = require('../models/StaffUser');
const Journey = require('../models/Journey');

// Middleware to check if staff is logged in
const requireStaffAuth = (req, res, next) => {
  if (!req.session.staffUserId) {
    return res.redirect('/staff');
  }
  next();
};

// Staff login/register page
router.get('/', (req, res) => {
  if (req.session.staffUserId) {
    return res.redirect('/staff/dashboard');
  }
  res.render('staff/login');
});

// Staff OTP password reset page
router.get('/otp-reset', (req, res) => {
  if (req.session.staffUserId) {
    return res.redirect('/staff/dashboard');
  }
  res.render('staff/otp-reset');
});

// Staff dashboard
router.get('/dashboard', requireStaffAuth, async (req, res) => {
  try {
    const staffUser = await StaffUser.findById(req.session.staffUserId);
    const activeJourneys = await Journey.find({
      staffUser: req.session.staffUserId,
      status: { $in: ['starting', 'running'] },
    });

    res.render('staff/dashboard', {
      user: staffUser,
      activeJourneys,
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// Journey entry form
router.get('/journey', requireStaffAuth, (req, res) => {
  res.render('staff/journey-form');
});

// Submit journey
router.post('/journey', requireStaffAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    const {
      startingPoint,
      destination,
      route,
      highway,
      busNumber,
      driverName,
      conductorName,
      depot,
      initialLat,
      initialLng
    } = req.body;

    if (isDbConnected) {
      // Database connected - create real journey
      const journeyData = {
        staffUser: req.session.staffUserId,
        startingPoint,
        destination,
        route,
        highway,
        busNumber,
        driverName,
        conductorName,
        depot,
      };

      // Set initial location if provided
      if (initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng)) {
        journeyData.currentLocation = {
          type: 'Point',
          coordinates: [parseFloat(initialLng), parseFloat(initialLat)]
        };
        journeyData.path = [{
          coordinates: [parseFloat(initialLng), parseFloat(initialLat)],
          timestamp: new Date()
        }];
      }

      const journey = new Journey(journeyData);
      await journey.save();
      
      res.json({ success: true, message: 'Journey created successfully', journeyId: journey._id });
    } else {
      // Demo mode - simulate journey creation
      const demoJourneyId = 'demo_' + Date.now();
      console.log('Demo journey created:', {
        id: demoJourneyId,
        staffUser: req.session.staffUserId,
        startingPoint,
        destination,
        route,
        busNumber
      });
      
      res.json({ 
        success: true, 
        message: 'Demo journey created successfully (not saved to database)', 
        journeyId: demoJourneyId,
        isDemo: true
      });
    }
  } catch (error) {
    console.error('Journey creation error:', error);
    res.status(400).json({ error: 'Journey creation failed: ' + error.message });
  }
});

// Update journey status
router.post('/journey/:id/status', requireStaffAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    let journey;
    
    if (isDbConnected) {
      // Database connected - use real data
      try {
        journey = await Journey.findOneAndUpdate(
          { _id: req.params.id, staffUser: req.session.staffUserId },
          { status, completedAt: status === 'completed' ? new Date() : null },
          { new: true }
        );
      } catch (dbError) {
        console.log('Database update failed, using demo mode');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - simulate status update
      journey = demoData.updateJourney(req.params.id, {
        status,
        completedAt: status === 'completed' ? new Date() : null
      });
      
      // If journey not found in demo data, create a mock response
      if (!journey) {
        journey = {
          _id: req.params.id,
          status,
          completedAt: status === 'completed' ? new Date() : null,
          staffUser: req.session.staffUserId,
          busNumber: 'DEMO-001',
          route: 'Demo Route'
        };
      }
    }

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    res.json({ success: true, journey, isDemo: !isDbConnected });
  } catch (error) {
    console.error('Journey status update error:', error);
    res.status(400).json({ error: 'Status update failed', isDemo: true });
  }
});

// Update location
router.post('/location/update', requireStaffAuth, async (req, res) => {
  try {
    const { lat, lng, journeyId } = req.body;
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    let journey;
    
    if (isDbConnected) {
      // Database connected - use real data
      try {
        journey = await Journey.findOneAndUpdate(
          { _id: journeyId, staffUser: req.session.staffUserId },
          {
            currentLocation: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $push: {
              path: {
                coordinates: [lng, lat],
                timestamp: new Date(),
              },
            },
          },
          { new: true }
        ).populate('staffUser');
      } catch (dbError) {
        console.log('Database update failed, using demo mode');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - simulate location update
      const updateData = {
        currentLocation: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      };
      
      journey = demoData.updateJourney(journeyId, updateData);
      
      // If journey not found, create mock journey
      if (!journey) {
        journey = {
          _id: journeyId,
          busNumber: 'DEMO-001',
          startingPoint: 'Demo Start',
          destination: 'Demo End',
          currentLocation: { type: 'Point', coordinates: [lng, lat] },
          status: 'running',
          staffUser: req.session.staffUserId
        };
      }
    }

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Emit real-time location update via Socket.IO (works in both modes)
    const io = req.app.get('io');
    if (io) {
      io.emit('locationUpdate', {
        journeyId: journey._id,
        busNumber: journey.busNumber,
        location: { lat, lng },
        timestamp: new Date(),
      });

      io.to(`journey_${journey._id}`).emit('busLocationUpdate', {
        location: { lat, lng },
        timestamp: new Date(),
      });

      io.to('admin').emit('adminLocationUpdate', {
        journeyId: journey._id,
        busNumber: journey.busNumber,
        startingPoint: journey.startingPoint,
        destination: journey.destination,
        location: { lat, lng },
        status: journey.status,
      });
    }

    res.json({ success: true, message: 'Location updated', isDemo: !isDbConnected });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(400).json({ error: 'Location update failed', isDemo: true });
  }
});

// Seat management page
router.get('/seats/:journeyId', requireStaffAuth, async (req, res) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.journeyId,
      staffUser: req.session.staffUserId,
    });

    if (!journey) {
      return res.status(404).render('error', { error: 'Journey not found' });
    }

    res.render('staff/seat-management', {
      journey,
      user: await StaffUser.findById(req.session.staffUserId)
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// Get journey details
router.get('/journey/:id', requireStaffAuth, async (req, res) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      staffUser: req.session.staffUserId,
    }).populate('staffUser');

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    res.json({ journey });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get journey history and stats for staff
router.get('/api/journey-history', requireStaffAuth, async (req, res) => {
  try {
    const staffUserId = req.session.staffUserId;
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    let allJourneys = [];
    
    if (isDbConnected) {
      // Database connected - use real data
      try {
        allJourneys = await Journey.find({ staffUser: staffUserId })
          .sort({ startedAt: -1 })
          .limit(50);
      } catch (dbError) {
        console.log('Database query failed, using demo data');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - use demo data
      allJourneys = demoData.findJourneys({ staffUser: staffUserId })
        .sort((a, b) => b.startedAt - a.startedAt)
        .slice(0, 50);
    }
    
    // Calculate distances for journeys that don't have it
    const journeysWithDistance = allJourneys.map(journey => {
      let distanceKm = journey.distanceKm;
      
      if (!distanceKm && journey.path && journey.path.length > 1) {
        // Simple distance calculation between start and end points
        const start = journey.path[0].coordinates;
        const end = journey.path[journey.path.length - 1].coordinates;
        distanceKm = calculateDistance(start[1], start[0], end[1], end[0]);
      }
      
      return {
        ...(journey.toObject ? journey.toObject() : journey),
        distanceKm: distanceKm ? Math.round(distanceKm) : null
      };
    });
    
    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      completedToday: journeysWithDistance.filter(j => 
        j.status === 'completed' && 
        new Date(j.startedAt) >= today
      ).length,
      totalKm: Math.round(journeysWithDistance.reduce((sum, j) => sum + (j.distanceKm || 0), 0)),
      hoursWorked: Math.round(journeysWithDistance
        .filter(j => j.status === 'completed' && j.completedAt)
        .reduce((sum, j) => {
          const duration = (new Date(j.completedAt) - new Date(j.startedAt)) / (1000 * 60 * 60);
          return sum + duration;
        }, 0))
    };
    
    res.json({
      success: true,
      journeys: journeysWithDistance,
      stats,
      isDemo: !isDbConnected
    });
  } catch (error) {
    console.error('Journey history error:', error);
    res.json({
      success: true,
      journeys: [],
      stats: { completedToday: 0, totalKm: 0, hoursWorked: 0 },
      isDemo: true
    });
  }
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

module.exports = router;
