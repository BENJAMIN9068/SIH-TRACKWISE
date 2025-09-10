const express = require('express');
const router = express.Router();
const StaffUser = require('../models/StaffUser');
const PublicUser = require('../models/PublicUser');

// Staff Registration
router.post('/staff/register', async (req, res) => {
    try {
        const { username, email, password, employeeId, name, phone, role } = req.body;
        
        // Check if user already exists
        const existingUser = await StaffUser.findOne({
            $or: [{ email }, { username }, { employeeId }]
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email, username, or employee ID already exists' 
            });
        }
        
        // Create new staff user
        const staffUser = new StaffUser({
            username, email, password, employeeId, name, phone, role
        });
        
        await staffUser.save();
        
        req.session.staffUserId = staffUser._id;
        req.session.userType = 'staff';
        
        res.json({ success: true, message: 'Registration successful', redirect: '/staff/dashboard' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Staff Login
router.post('/staff/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username or email
        const staffUser = await StaffUser.findOne({
            $or: [{ username }, { email: username }]
        });
        
        if (!staffUser) {
            return res.status(400).json({ error: 'User not found. Please register first.' });
        }
        
        // Check password
        const isMatch = await staffUser.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Password is incorrect' });
        }
        
        // Update last login
        staffUser.lastLogin = new Date();
        await staffUser.save();
        
        req.session.staffUserId = staffUser._id;
        req.session.userType = 'staff';
        
        res.json({ success: true, message: 'Login successful', redirect: '/staff/dashboard' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Public Registration
router.post('/public/register', async (req, res) => {
    try {
        const { username, email, password, name, phone } = req.body;
        
        // Check if user already exists
        const existingUser = await PublicUser.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email or username already exists' 
            });
        }
        
        // Create new public user
        const publicUser = new PublicUser({
            username, email, password, name, phone
        });
        
        await publicUser.save();
        
        req.session.publicUserId = publicUser._id;
        req.session.userType = 'public';
        
        res.json({ success: true, message: 'Registration successful', redirect: '/public/dashboard' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Public Login
router.post('/public/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username or email
        const publicUser = await PublicUser.findOne({
            $or: [{ username }, { email: username }]
        });
        
        if (!publicUser) {
            return res.status(400).json({ error: 'User not found. Please register first.' });
        }
        
        // Check password
        const isMatch = await publicUser.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Password is incorrect' });
        }
        
        // Update last login
        publicUser.lastLogin = new Date();
        await publicUser.save();
        
        req.session.publicUserId = publicUser._id;
        req.session.userType = 'public';
        
        res.json({ success: true, message: 'Login successful', redirect: '/public/dashboard' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin Login
router.post('/admin/login', (req, res) => {
    try {
        const { id, password } = req.body;
        
        // Check admin credentials
        if (id !== process.env.ADMIN_ID || password !== process.env.ADMIN_PASS) {
            return res.status(400).json({ error: 'Invalid admin credentials' });
        }
        
        req.session.isAdmin = true;
        req.session.userType = 'admin';
        
        res.json({ success: true, message: 'Admin login successful', redirect: '/admin/dashboard' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ success: true, message: 'Logged out successfully', redirect: '/' });
    });
});

module.exports = router;
