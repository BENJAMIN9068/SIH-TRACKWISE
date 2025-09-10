const express = require('express');
const router = express.Router();
const Journey = require('../models/Journey');
const StaffUser = require('../models/StaffUser');
const PublicUser = require('../models/PublicUser');

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
                totalPublicUsers
            },
            recentJourneys
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Live buses page
router.get('/live-buses', requireAdminAuth, async (req, res) => {
    try {
        const liveBuses = await Journey.find({ 
            status: { $in: ['starting', 'running'] } 
        }).populate('staffUser').sort({ startedAt: -1 });
        
        res.render('admin/live-buses', { liveBuses });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
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
        const runningBuses = await Journey.find({ 
            status: { $in: ['starting', 'running'] },
            'currentLocation.coordinates': { $exists: true, $ne: [0, 0] }
        }).populate('staffUser');
        
        res.render('admin/buses-map', { runningBuses });
    } catch (error) {
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
        const liveBuses = await Journey.find({ 
            status: { $in: ['starting', 'running'] },
            'currentLocation.coordinates': { $exists: true, $ne: [0, 0] }
        }).populate('staffUser').select('busNumber startingPoint destination currentLocation status route highway');
        
        res.json({ buses: liveBuses });
    } catch (error) {
        res.status(400).json({ error: error.message });
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

module.exports = router;
