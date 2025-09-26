const express = require('express');
const router = express.Router();
const Journey = require('../models/Journey');

// Search buses between two points
router.get('/search', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'From and To parameters are required' });
    }

    console.log(`Searching for buses from "${from}" to "${to}"`);

    // More flexible search for buses that match the route
    const searchQuery = {
      status: { $in: ['starting', 'running'] },
      $or: [
        // Exact match on starting point and destination
        {
          startingPoint: { $regex: new RegExp(from, 'i') },
          destination: { $regex: new RegExp(to, 'i') },
        },
        // Reverse direction
        {
          startingPoint: { $regex: new RegExp(to, 'i') },
          destination: { $regex: new RegExp(from, 'i') },
        },
        // Match in route field
        {
          route: { $regex: new RegExp(from, 'i') },
          destination: { $regex: new RegExp(to, 'i') },
        },
        {
          startingPoint: { $regex: new RegExp(from, 'i') },
          route: { $regex: new RegExp(to, 'i') },
        },
        // Highway matches
        {
          highway: { $regex: new RegExp(`${from}|${to}`, 'i') },
          $or: [
            { startingPoint: { $regex: new RegExp(from, 'i') } },
            { destination: { $regex: new RegExp(to, 'i') } },
            { startingPoint: { $regex: new RegExp(to, 'i') } },
            { destination: { $regex: new RegExp(from, 'i') } },
          ],
        },
      ],
    };

    const allBuses = await Journey.find(searchQuery)
      .populate('staffUser', 'name')
      .select('busNumber startingPoint destination route highway currentLocation status depot startedAt seatInfo')
      .sort({ startedAt: -1 });

    // Filter buses and add location status
    const buses = allBuses.map(bus => {
      let hasValidLocation = false;
      let locationStatus = 'No GPS';
      
      if (bus.currentLocation?.coordinates) {
        const [lng, lat] = bus.currentLocation.coordinates;
        if (lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat) && Math.abs(lng) > 0.1 && Math.abs(lat) > 0.1) {
          hasValidLocation = true;
          locationStatus = 'GPS Active';
        } else {
          locationStatus = 'GPS Inactive';
        }
      }
      
      // Add seat availability information
      const seatAvailability = {
        totalSeats: bus.seatInfo?.totalSeats || 0,
        availableSeats: bus.seatInfo?.availableSeats || 0,
        occupiedSeats: (bus.seatInfo?.totalSeats || 0) - (bus.seatInfo?.availableSeats || 0),
        seatStatus: bus.seatInfo?.totalSeats ? 'Available' : 'Not configured'
      };
      
      return {
        ...bus.toObject(),
        hasValidLocation,
        locationStatus,
        seatAvailability
      };
    });

    console.log(`Found ${buses.length} buses matching the search, ${buses.filter(b => b.hasValidLocation).length} with valid GPS`);

    res.json({ 
      success: true, 
      buses,
      totalFound: buses.length,
      withGPS: buses.filter(b => b.hasValidLocation).length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get bus live location
router.get('/bus/:id/location', async (req, res) => {
  try {
    const bus = await Journey.findById(req.params.id).select(
      'busNumber startingPoint destination currentLocation route highway path status'
    );

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    let location = null;
    if (bus.currentLocation?.coordinates) {
      const [lng, lat] = bus.currentLocation.coordinates;
      // Only provide location if coordinates are valid (not 0,0 and not null/NaN)
      if (lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat) && Math.abs(lng) > 0.1 && Math.abs(lat) > 0.1) {
        location = { lat, lng };
      }
    }
    
    res.json({ 
      success: true, 
      location, 
      bus: {
        _id: bus._id,
        busNumber: bus.busNumber,
        startingPoint: bus.startingPoint,
        destination: bus.destination,
        route: bus.route,
        highway: bus.highway,
        status: bus.status
      },
      hasValidLocation: !!location
    });
  } catch (error) {
    console.error('Bus location API error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all active buses (for admin)
router.get('/buses/active', async (req, res) => {
  try {
    const buses = await Journey.find({
      status: { $in: ['starting', 'running'] },
    })
      .populate('staffUser', 'name role')
      .sort({ startedAt: -1 });

    res.json({ buses });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Debug endpoint to see all journeys (remove in production)
router.get('/debug/journeys', async (req, res) => {
  try {
    const allJourneys = await Journey.find({})
      .populate('staffUser', 'name')
      .select('busNumber startingPoint destination route highway status startedAt')
      .sort({ startedAt: -1 })
      .limit(20);
    
    const activeJourneys = await Journey.find({ status: { $in: ['starting', 'running'] } })
      .populate('staffUser', 'name')
      .select('busNumber startingPoint destination route highway status startedAt')
      .sort({ startedAt: -1 });
    
    res.json({
      success: true,
      total: allJourneys.length,
      active: activeJourneys.length,
      allJourneys: allJourneys,
      activeJourneys: activeJourneys
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
