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

// Staff dashboard
router.get('/dashboard', requireStaffAuth, async (req, res) => {
    try {
        const staffUser = await StaffUser.findById(req.session.staffUserId);
        const activeJourneys = await Journey.find({ 
            staffUser: req.session.staffUserId, 
            status: { $in: ['starting', 'running'] } 
        });
        
        res.render('staff/dashboard', { 
            user: staffUser, 
            activeJourneys 
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
        const {
            startingPoint,
            destination,
            route,
            highway,
            busNumber,
            driverName,
            conductorName,
            depot
        } = req.body;
        
        const journey = new Journey({
            staffUser: req.session.staffUserId,
            startingPoint,
            destination,
            route,
            highway,
            busNumber,
            driverName,
            conductorName,
            depot
        });
        
        await journey.save();
        res.json({ success: true, message: 'Journey created successfully', journeyId: journey._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update journey status
router.post('/journey/:id/status', requireStaffAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const journey = await Journey.findOneAndUpdate(
            { _id: req.params.id, staffUser: req.session.staffUserId },
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

// Update location
router.post('/location/update', requireStaffAuth, async (req, res) => {
    try {
        const { lat, lng, journeyId } = req.body;
        
        const journey = await Journey.findOneAndUpdate(
            { _id: journeyId, staffUser: req.session.staffUserId },
            {
                currentLocation: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $push: {
                    path: {
                        coordinates: [lng, lat],
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        ).populate('staffUser');
        
        if (!journey) {
            return res.status(404).json({ error: 'Journey not found' });
        }
        
        // Emit real-time location update via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit('locationUpdate', {
                journeyId: journey._id,
                busNumber: journey.busNumber,
                location: {
                    lat,
                    lng
                },
                timestamp: new Date()
            });
            
            // Emit to specific rooms
            io.to(`journey_${journey._id}`).emit('busLocationUpdate', {
                location: { lat, lng },
                timestamp: new Date()
            });
            
            io.to('admin').emit('adminLocationUpdate', {
                journeyId: journey._id,
                busNumber: journey.busNumber,
                startingPoint: journey.startingPoint,
                destination: journey.destination,
                location: { lat, lng },
                status: journey.status
            });
        }
        
        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get journey details
router.get('/journey/:id', requireStaffAuth, async (req, res) => {
    try {
        const journey = await Journey.findOne({
            _id: req.params.id,
            staffUser: req.session.staffUserId
        }).populate('staffUser');
        
        if (!journey) {
            return res.status(404).json({ error: 'Journey not found' });
        }
        
        res.json({ journey });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
