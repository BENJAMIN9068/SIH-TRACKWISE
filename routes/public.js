const express = require('express');
const router = express.Router();
const PublicUser = require('../models/PublicUser');
const Journey = require('../models/Journey');
const TravelHistory = require('../models/TravelHistory');

// Middleware to check if public user is logged in
const requirePublicAuth = (req, res, next) => {
  if (!req.session.publicUserId) {
    return res.redirect('/public');
  }
  next();
};

// Public login/register page
router.get('/', (req, res) => {
  if (req.session.publicUserId) {
    return res.redirect('/public/dashboard');
  }
  res.render('public/login');
});

// Public password reset page
router.get('/reset-pass', (req, res) => {
  res.render('public/reset-password');
});

// Public OTP password reset page
router.get('/otp-reset', (req, res) => {
  if (req.session.publicUserId) {
    return res.redirect('/public/dashboard');
  }
  res.render('public/otp-reset');
});

// Public dashboard
router.get('/dashboard', requirePublicAuth, async (req, res) => {
  try {
    const publicUser = await PublicUser.findById(req.session.publicUserId);
    res.render('public/dashboard', { user: publicUser });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// Search page
router.get('/search', requirePublicAuth, (req, res) => {
  res.render('public/search');
});

// Bus tracking page
router.get('/track/:id', requirePublicAuth, async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id).select(
      'busNumber startingPoint destination route highway currentLocation status depot'
    );

    if (!journey) {
      return res.status(404).render('error', { error: 'Bus not found' });
    }

    res.render('public/track', { journey });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// API: Get travel history for public user
router.get('/api/travel-history', requirePublicAuth, async (req, res) => {
  try {
    const publicUserId = req.session.publicUserId;
    
    // Get travel history for this user
    const travels = await TravelHistory.find({ publicUser: publicUserId })
      .sort({ searchedAt: -1 })
      .limit(50); // Last 50 searches
    
    // Calculate stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const stats = {
      totalSearches: travels.length,
      completedTrips: travels.filter(t => t.confirmed === true).length,
      totalKmTraveled: Math.round(travels
        .filter(t => t.confirmed === true)
        .reduce((sum, t) => sum + (t.distanceKm || 0), 0)),
      thisMonthTrips: travels.filter(t => 
        t.confirmed === true && 
        new Date(t.searchedAt) >= thisMonth
      ).length
    };
    
    res.json({
      success: true,
      travels,
      stats
    });
  } catch (error) {
    console.error('Travel history error:', error);
    res.status(400).json({ error: error.message });
  }
});

// API: Confirm travel
router.post('/api/confirm-travel', requirePublicAuth, async (req, res) => {
  try {
    const { travelId, confirmed } = req.body;
    const publicUserId = req.session.publicUserId;
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    let travel;
    
    if (isDbConnected) {
      // Database connected - use real data
      try {
        travel = await TravelHistory.findOneAndUpdate(
          { _id: travelId, publicUser: publicUserId },
          { confirmed, confirmedAt: new Date() },
          { new: true }
        );
      } catch (dbError) {
        console.log('Database update failed, using demo data');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - update demo data
      travel = demoData.updateTravelHistory(travelId, publicUserId, { confirmed });
    }
    
    if (!travel) {
      return res.status(404).json({ error: 'Travel record not found' });
    }
    
    res.json({ success: true, travel, isDemo: !isDbConnected });
  } catch (error) {
    console.error('Travel confirmation error:', error);
    res.status(400).json({ error: 'Confirmation failed', isDemo: true });
  }
});

// API: Check for pending confirmations
router.get('/api/check-pending-confirmations', requirePublicAuth, async (req, res) => {
  try {
    const publicUserId = req.session.publicUserId;
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    let pendingTravel = null;
    
    if (isDbConnected) {
      // Database connected - use real data
      try {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        
        pendingTravel = await TravelHistory.findOne({
          publicUser: publicUserId,
          searchedAt: { $gte: tenMinutesAgo, $lte: fiveMinutesAgo },
          confirmed: null
        }).sort({ searchedAt: -1 });
      } catch (dbError) {
        console.log('Database query failed, using demo data');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - simulate pending travel
      const travels = demoData.getTravelHistory(publicUserId);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      
      pendingTravel = travels.find(travel => 
        travel.searchedAt >= tenMinutesAgo && 
        travel.searchedAt <= fiveMinutesAgo && 
        travel.confirmed === null
      ) || null;
    }
    
    res.json({
      success: true,
      pendingTravel,
      isDemo: !isDbConnected
    });
  } catch (error) {
    console.error('Pending confirmations check error:', error);
    res.json({ success: true, pendingTravel: null, isDemo: true });
  }
});

// API: Record bus search (to be called when user searches for buses)
router.post('/api/record-search', requirePublicAuth, async (req, res) => {
  try {
    const { fromStation, toStation, busNumber, journeyId } = req.body;
    const publicUserId = req.session.publicUserId;
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    // Calculate approximate distance
    const distanceKm = calculateApproximateDistance(fromStation, toStation);
    
    let travelHistory;
    
    if (isDbConnected) {
      // Database connected - use real data
      try {
        travelHistory = new TravelHistory({
          publicUser: publicUserId,
          fromStation,
          toStation,
          busNumber,
          journeyId,
          distanceKm,
          searchQuery: `${fromStation} to ${toStation}`
        });
        
        await travelHistory.save();
      } catch (dbError) {
        console.log('Database save failed, using demo data');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - add to demo data
      travelHistory = demoData.addTravelHistory({
        publicUser: publicUserId,
        fromStation,
        toStation,
        busNumber,
        journeyId,
        distanceKm,
        searchQuery: `${fromStation} to ${toStation}`
      });
    }
    
    res.json({ 
      success: true, 
      travelId: travelHistory._id,
      isDemo: !isDbConnected 
    });
  } catch (error) {
    console.error('Record search error:', error);
    res.status(400).json({ error: 'Search recording failed', isDemo: true });
  }
});

// API: Search for buses
router.get('/api/search-buses', requirePublicAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    
    let buses = [];
    
    if (isDbConnected) {
      // Database connected - search real data
      try {
        buses = await Journey.find({
          status: { $in: ['starting', 'running'] },
          $or: [
            { startingPoint: new RegExp(from, 'i') },
            { destination: new RegExp(to, 'i') }
          ]
        }).populate('staffUser');
      } catch (dbError) {
        console.log('Database search failed, using demo data');
        isDbConnected = false;
      }
    }
    
    if (!isDbConnected) {
      // Demo mode - search demo data
      buses = demoData.searchBuses(from || '', to || '');
    }
    
    res.json({
      success: true,
      buses,
      isDemo: !isDbConnected
    });
  } catch (error) {
    console.error('Bus search error:', error);
    res.json({
      success: true,
      buses: [],
      isDemo: true
    });
  }
});

// Helper function to calculate approximate distance
function calculateApproximateDistance(fromStation, toStation) {
  // This is a simple approximation - in a real app, you'd use proper geocoding
  const cityDistances = {
    'mumbai-pune': 150,
    'delhi-gurgaon': 30,
    'bangalore-mysore': 140,
    'chennai-pondicherry': 160,
    'kolkata-durgapur': 170,
    'hyderabad-warangal': 150
  };
  
  const routeKey = `${fromStation.toLowerCase()}-${toStation.toLowerCase()}`;
  const reverseKey = `${toStation.toLowerCase()}-${fromStation.toLowerCase()}`;
  
  return cityDistances[routeKey] || cityDistances[reverseKey] || Math.floor(Math.random() * 200) + 50;
}

module.exports = router;
