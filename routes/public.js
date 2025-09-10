const express = require('express');
const router = express.Router();
const PublicUser = require('../models/PublicUser');
const Journey = require('../models/Journey');

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
        const journey = await Journey.findById(req.params.id)
            .select('busNumber startingPoint destination route highway currentLocation status depot');
        
        if (!journey) {
            return res.status(404).render('error', { error: 'Bus not found' });
        }
        
        res.render('public/track', { journey });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;
