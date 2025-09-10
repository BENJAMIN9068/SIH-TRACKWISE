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
        
        // Search for buses that match the route
        const buses = await Journey.find({
            status: { $in: ['starting', 'running'] },
            $or: [
                { startingPoint: { $regex: new RegExp(from, 'i') }, destination: { $regex: new RegExp(to, 'i') } },
                { route: { $regex: new RegExp(`${from}.*${to}|${to}.*${from}`, 'i') } },
                { highway: { $regex: new RegExp(`${from}|${to}`, 'i') } }
            ]
        }).populate('staffUser', 'name').select('busNumber startingPoint destination route highway currentLocation status depot');
        
        res.json({ buses });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get bus live location
router.get('/bus/:id/location', async (req, res) => {
    try {
        const bus = await Journey.findById(req.params.id)
            .select('busNumber startingPoint destination currentLocation route highway path status');
        
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        
        res.json({ bus });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all active buses (for admin)
router.get('/buses/active', async (req, res) => {
    try {
        const buses = await Journey.find({ 
            status: { $in: ['starting', 'running'] } 
        }).populate('staffUser', 'name role').sort({ startedAt: -1 });
        
        res.json({ buses });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
