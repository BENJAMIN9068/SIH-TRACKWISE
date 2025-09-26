const express = require('express');
const router = express.Router();
const Journey = require('../models/Journey');

// Middleware to check if user is authenticated as staff
const requireAuth = (req, res, next) => {
  if (req.session && req.session.staffUserId) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

// Initialize seat layout for a bus
router.post('/initialize/:journeyId', requireAuth, async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { totalSeats, rows, seatsPerRow } = req.body;

    if (!totalSeats || totalSeats <= 0) {
      return res.status(400).json({ error: 'Total seats must be greater than 0' });
    }

    const journey = await Journey.findById(journeyId);
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Check if user is associated with this journey
    if (journey.staffUser.toString() !== req.session.staffUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Initialize seat info
    journey.seatInfo = {
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      occupiedSeats: [],
      seatLayout: {
        rows: rows || Math.ceil(totalSeats / (seatsPerRow || 4)),
        seatsPerRow: seatsPerRow || 4,
        lastUpdated: new Date(),
        updatedBy: journey.conductorName
      }
    };

    await journey.save();

    res.json({
      success: true,
      message: 'Seat layout initialized successfully',
      seatInfo: journey.seatInfo
    });

  } catch (error) {
    console.error('Error initializing seats:', error);
    res.status(500).json({ error: 'Failed to initialize seats' });
  }
});

// Get current seat status for a journey
router.get('/status/:journeyId', async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.journeyId)
      .select('busNumber startingPoint destination seatInfo status')
      .populate('staffUser', 'name');

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    res.json({
      success: true,
      busInfo: {
        busNumber: journey.busNumber,
        route: `${journey.startingPoint} → ${journey.destination}`,
        status: journey.status
      },
      seatInfo: journey.seatInfo || {
        totalSeats: 0,
        availableSeats: 0,
        occupiedSeats: [],
        seatLayout: { rows: 0, seatsPerRow: 4 }
      }
    });

  } catch (error) {
    console.error('Error getting seat status:', error);
    res.status(500).json({ error: 'Failed to get seat status' });
  }
});

// Occupy a seat
router.post('/occupy/:journeyId', requireAuth, async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { seatNumber, passengerName, boardedAt, destination } = req.body;

    if (!seatNumber) {
      return res.status(400).json({ error: 'Seat number is required' });
    }

    const journey = await Journey.findById(journeyId);
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Check if user is associated with this journey
    if (journey.staffUser.toString() !== req.session.staffUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if seat is already occupied
    const existingSeat = journey.seatInfo.occupiedSeats.find(
      seat => seat.seatNumber === seatNumber
    );

    if (existingSeat) {
      return res.status(400).json({ error: 'Seat is already occupied' });
    }

    // Add occupied seat
    journey.seatInfo.occupiedSeats.push({
      seatNumber,
      passengerName: passengerName || 'Unknown',
      boardedAt: boardedAt || journey.startingPoint,
      destination: destination || journey.destination,
      occupiedAt: new Date()
    });

    // Update available seats count
    journey.seatInfo.availableSeats = Math.max(0, 
      journey.seatInfo.totalSeats - journey.seatInfo.occupiedSeats.length
    );

    // Update last modified info
    journey.seatInfo.seatLayout.lastUpdated = new Date();
    journey.seatInfo.seatLayout.updatedBy = journey.conductorName;

    await journey.save();

    res.json({
      success: true,
      message: `Seat ${seatNumber} occupied successfully`,
      seatInfo: {
        totalSeats: journey.seatInfo.totalSeats,
        availableSeats: journey.seatInfo.availableSeats,
        occupiedCount: journey.seatInfo.occupiedSeats.length
      }
    });

  } catch (error) {
    console.error('Error occupying seat:', error);
    res.status(500).json({ error: 'Failed to occupy seat' });
  }
});

// Free a seat
router.post('/free/:journeyId', requireAuth, async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { seatNumber } = req.body;

    if (!seatNumber) {
      return res.status(400).json({ error: 'Seat number is required' });
    }

    const journey = await Journey.findById(journeyId);
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Check if user is associated with this journey
    if (journey.staffUser.toString() !== req.session.staffUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove occupied seat
    const seatIndex = journey.seatInfo.occupiedSeats.findIndex(
      seat => seat.seatNumber === seatNumber
    );

    if (seatIndex === -1) {
      return res.status(400).json({ error: 'Seat is not occupied' });
    }

    journey.seatInfo.occupiedSeats.splice(seatIndex, 1);

    // Update available seats count
    journey.seatInfo.availableSeats = Math.max(0, 
      journey.seatInfo.totalSeats - journey.seatInfo.occupiedSeats.length
    );

    // Update last modified info
    journey.seatInfo.seatLayout.lastUpdated = new Date();
    journey.seatInfo.seatLayout.updatedBy = journey.conductorName;

    await journey.save();

    res.json({
      success: true,
      message: `Seat ${seatNumber} freed successfully`,
      seatInfo: {
        totalSeats: journey.seatInfo.totalSeats,
        availableSeats: journey.seatInfo.availableSeats,
        occupiedCount: journey.seatInfo.occupiedSeats.length
      }
    });

  } catch (error) {
    console.error('Error freeing seat:', error);
    res.status(500).json({ error: 'Failed to free seat' });
  }
});

// Bulk update seats (for multiple passenger changes)
router.post('/bulk-update/:journeyId', requireAuth, async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { occupiedSeats } = req.body;

    if (!Array.isArray(occupiedSeats)) {
      return res.status(400).json({ error: 'Occupied seats must be an array' });
    }

    const journey = await Journey.findById(journeyId);
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Check if user is associated with this journey
    if (journey.staffUser.toString() !== req.session.staffUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate seat numbers
    const maxSeatNumber = journey.seatInfo.totalSeats;
    for (const seat of occupiedSeats) {
      const seatNum = parseInt(seat.seatNumber);
      if (seatNum < 1 || seatNum > maxSeatNumber) {
        return res.status(400).json({ 
          error: `Invalid seat number: ${seat.seatNumber}` 
        });
      }
    }

    // Update occupied seats
    journey.seatInfo.occupiedSeats = occupiedSeats.map(seat => ({
      seatNumber: seat.seatNumber,
      passengerName: seat.passengerName || 'Unknown',
      boardedAt: seat.boardedAt || journey.startingPoint,
      destination: seat.destination || journey.destination,
      occupiedAt: new Date()
    }));

    // Update available seats count
    journey.seatInfo.availableSeats = Math.max(0, 
      journey.seatInfo.totalSeats - journey.seatInfo.occupiedSeats.length
    );

    // Update last modified info
    journey.seatInfo.seatLayout.lastUpdated = new Date();
    journey.seatInfo.seatLayout.updatedBy = journey.conductorName;

    await journey.save();

    res.json({
      success: true,
      message: 'Seat occupancy updated successfully',
      seatInfo: {
        totalSeats: journey.seatInfo.totalSeats,
        availableSeats: journey.seatInfo.availableSeats,
        occupiedCount: journey.seatInfo.occupiedSeats.length
      }
    });

  } catch (error) {
    console.error('Error updating seats:', error);
    res.status(500).json({ error: 'Failed to update seats' });
  }
});

// Get detailed seat map for conductor interface
router.get('/map/:journeyId', requireAuth, async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.journeyId);
    
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Check if user is associated with this journey
    if (journey.staffUser.toString() !== req.session.staffUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!journey.seatInfo || !journey.seatInfo.totalSeats) {
      return res.status(400).json({ error: 'Seat layout not initialized' });
    }

    // Generate seat map
    const { totalSeats, occupiedSeats, seatLayout } = journey.seatInfo;
    const { rows, seatsPerRow } = seatLayout;
    
    const seatMap = [];
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let seatInRow = 1; seatInRow <= seatsPerRow; seatInRow++) {
        const seatNumber = ((row - 1) * seatsPerRow + seatInRow).toString();
        
        if (parseInt(seatNumber) <= totalSeats) {
          const occupiedSeat = occupiedSeats.find(s => s.seatNumber === seatNumber);
          
          rowSeats.push({
            seatNumber,
            isOccupied: !!occupiedSeat,
            passenger: occupiedSeat ? {
              name: occupiedSeat.passengerName,
              boardedAt: occupiedSeat.boardedAt,
              destination: occupiedSeat.destination,
              occupiedAt: occupiedSeat.occupiedAt
            } : null
          });
        }
      }
      if (rowSeats.length > 0) {
        seatMap.push(rowSeats);
      }
    }

    res.json({
      success: true,
      busInfo: {
        busNumber: journey.busNumber,
        route: `${journey.startingPoint} → ${journey.destination}`,
        conductor: journey.conductorName
      },
      seatInfo: journey.seatInfo,
      seatMap
    });

  } catch (error) {
    console.error('Error getting seat map:', error);
    res.status(500).json({ error: 'Failed to get seat map' });
  }
});

module.exports = router;