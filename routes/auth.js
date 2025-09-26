const express = require('express');
const router = express.Router();
const StaffUser = require('../models/StaffUser');
const PublicUser = require('../models/PublicUser');
const StaffPasswordReset = require('../models/StaffPasswordReset');
const PublicPasswordReset = require('../models/PublicPasswordReset');
const otpService = require('../utils/otpService');
const OTP = require('../models/OTP');

// Staff Registration
router.post('/staff/register', async (req, res) => {
  try {
    const { username, email, password, employeeId, name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await StaffUser.findOne({
      $or: [{ email }, { username }, { employeeId }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email, username, or employee ID already exists',
      });
    }

    // Create new staff user
    const staffUser = new StaffUser({
      username,
      email,
      password,
      employeeId,
      name,
      phone,
      role,
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
    const { conductorId, password } = req.body;

    // Find user by conductor ID (employeeId)
    const staffUser = await StaffUser.findOne({
      employeeId: conductorId,
      role: 'conductor'
    });

    if (!staffUser) {
      return res.status(400).json({ error: 'Invalid conductor ID. Please contact administrator.' });
    }

    // Check password
    const isMatch = await staffUser.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password. Please try again.' });
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

// Staff Forgot Password
router.post('/staff/forgot-password', async (req, res) => {
  try {
    const { conductorId, conductorName, phoneNumber } = req.body;

    // Verify conductor exists
    const staffUser = await StaffUser.findOne({
      employeeId: conductorId,
      name: conductorName,
      phone: phoneNumber,
      role: 'conductor'
    });

    if (!staffUser) {
      return res.status(400).json({ error: 'Invalid conductor details. Please verify your information.' });
    }

    // Check if there's already a pending request
    const existingRequest = await StaffPasswordReset.findOne({
      conductorId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'A password reset request is already pending for this conductor ID.' });
    }

    // Create password reset request
    const resetRequest = new StaffPasswordReset({
      conductorId,
      conductorName,
      phoneNumber
    });

    await resetRequest.save();

    res.json({ 
      success: true, 
      message: 'Password reset request submitted. An admin will process your request and send new password to your phone number.' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Public Forgot Password
router.post('/public/forgot-password', async (req, res) => {
  try {
    const { username, email } = req.body;

    // Verify public user exists
    const publicUser = await PublicUser.findOne({
      $or: [{ username }, { email }],
      username,
      email
    });

    if (!publicUser) {
      return res.status(400).json({ error: 'No account found with this username and email combination.' });
    }

    // Check if there's already a pending request
    const existingRequest = await PublicPasswordReset.findOne({
      username,
      email,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'A password reset request is already pending for this account.' });
    }

    // Create password reset request
    const resetRequest = new PublicPasswordReset({
      username,
      email
    });

    await resetRequest.save();

    res.json({ 
      success: true, 
      message: 'Password reset request submitted successfully. An administrator will review your request and send a new password to your email.' 
    });
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
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or username already exists',
      });
    }

    // Create new public user
    const publicUser = new PublicUser({
      username,
      email,
      password,
      name,
      phone,
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
      $or: [{ username }, { email: username }],
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

// OTP-based Password Reset Routes

// Request OTP for Staff Password Reset
router.post('/staff/request-otp', async (req, res) => {
  try {
    const { employeeId, email } = req.body;

    // Find staff user with provided employeeId and email
    const staffUser = await StaffUser.findOne({
      employeeId,
      email: email.toLowerCase(),
      role: 'conductor'
    });

    if (!staffUser) {
      return res.status(400).json({ error: 'No account found with this Employee ID and email combination.' });
    }

    // Check if email service is configured
    if (!otpService.isEmailConfigured()) {
      return res.status(500).json({ error: 'Email service is not configured. Please contact administrator.' });
    }

    // Generate and save OTP
    const otpResult = await otpService.generateAndSaveOTP(
      staffUser.email,
      'staff',
      staffUser.employeeId,
      staffUser.phone
    );

    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    // Send OTP via email
    const emailResult = await otpService.sendOTPEmail(
      staffUser.email,
      otpResult.otp,
      staffUser.name,
      'staff'
    );

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ 
      success: true, 
      message: `OTP has been sent to ${staffUser.email}. Please check your email and enter the 6-digit code.`,
      email: staffUser.email,
      expiresAt: otpResult.expiresAt
    });
  } catch (error) {
    console.error('Error requesting staff OTP:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// Request OTP for Public User Password Reset
router.post('/public/request-otp', async (req, res) => {
  try {
    const { username, email } = req.body;

    // Find public user with provided username and email
    const publicUser = await PublicUser.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
      username,
      email: email.toLowerCase()
    });

    if (!publicUser) {
      return res.status(400).json({ error: 'No account found with this username and email combination.' });
    }

    // Check if email service is configured
    if (!otpService.isEmailConfigured()) {
      return res.status(500).json({ error: 'Email service is not configured. Please contact administrator.' });
    }

    // Generate and save OTP
    const otpResult = await otpService.generateAndSaveOTP(
      publicUser.email,
      'public',
      publicUser.username,
      publicUser.phone
    );

    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    // Send OTP via email
    const emailResult = await otpService.sendOTPEmail(
      publicUser.email,
      otpResult.otp,
      publicUser.name,
      'public'
    );

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ 
      success: true, 
      message: `OTP has been sent to ${publicUser.email}. Please check your email and enter the 6-digit code.`,
      email: publicUser.email,
      expiresAt: otpResult.expiresAt
    });
  } catch (error) {
    console.error('Error requesting public OTP:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// Verify OTP for Staff
router.post('/staff/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const verificationResult = await otpService.verifyOTP(email, otp, 'staff');

    if (!verificationResult.success) {
      return res.status(400).json({ error: verificationResult.error });
    }

    // Store verification in session for password reset
    req.session.otpVerified = {
      email,
      userType: 'staff',
      userId: verificationResult.userId,
      otpId: verificationResult.otpId,
      timestamp: Date.now()
    };

    res.json({ 
      success: true, 
      message: 'OTP verified successfully. You can now reset your password.',
      canResetPassword: true
    });
  } catch (error) {
    console.error('Error verifying staff OTP:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// Verify OTP for Public User
router.post('/public/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const verificationResult = await otpService.verifyOTP(email, otp, 'public');

    if (!verificationResult.success) {
      return res.status(400).json({ error: verificationResult.error });
    }

    // Store verification in session for password reset
    req.session.otpVerified = {
      email,
      userType: 'public',
      userId: verificationResult.userId,
      otpId: verificationResult.otpId,
      timestamp: Date.now()
    };

    res.json({ 
      success: true, 
      message: 'OTP verified successfully. You can now reset your password.',
      canResetPassword: true
    });
  } catch (error) {
    console.error('Error verifying public OTP:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// Reset Password for Staff (after OTP verification)
router.post('/staff/reset-password', async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // Check if OTP was verified in this session
    if (!req.session.otpVerified || req.session.otpVerified.userType !== 'staff') {
      return res.status(400).json({ error: 'OTP verification required. Please verify your OTP first.' });
    }

    // Check if OTP verification is still valid (within 15 minutes)
    const verificationAge = Date.now() - req.session.otpVerified.timestamp;
    if (verificationAge > 15 * 60 * 1000) {
      delete req.session.otpVerified;
      return res.status(400).json({ error: 'OTP verification expired. Please start over.' });
    }

    // Validate password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Find and update staff user
    const staffUser = await StaffUser.findOne({ 
      employeeId: req.session.otpVerified.userId,
      email: req.session.otpVerified.email 
    });

    if (!staffUser) {
      return res.status(400).json({ error: 'User not found.' });
    }

    // Update password
    staffUser.password = newPassword;
    await staffUser.save();

    // Clear session data
    delete req.session.otpVerified;

    res.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Error resetting staff password:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// Reset Password for Public User (after OTP verification)
router.post('/public/reset-password', async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // Check if OTP was verified in this session
    if (!req.session.otpVerified || req.session.otpVerified.userType !== 'public') {
      return res.status(400).json({ error: 'OTP verification required. Please verify your OTP first.' });
    }

    // Check if OTP verification is still valid (within 15 minutes)
    const verificationAge = Date.now() - req.session.otpVerified.timestamp;
    if (verificationAge > 15 * 60 * 1000) {
      delete req.session.otpVerified;
      return res.status(400).json({ error: 'OTP verification expired. Please start over.' });
    }

    // Validate password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Find and update public user
    const publicUser = await PublicUser.findOne({ 
      username: req.session.otpVerified.userId,
      email: req.session.otpVerified.email 
    });

    if (!publicUser) {
      return res.status(400).json({ error: 'User not found.' });
    }

    // Update password
    publicUser.password = newPassword;
    await publicUser.save();

    // Clear session data
    delete req.session.otpVerified;

    res.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Error resetting public password:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const userType = req.session.userType;
  
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    
    // Redirect based on user type
    let redirectUrl = '/';
    if (userType === 'admin') {
      redirectUrl = '/admin';
    } else if (userType === 'staff') {
      redirectUrl = '/staff';
    } else if (userType === 'public') {
      redirectUrl = '/public';
    }
    
    res.redirect(redirectUrl);
  });
});

module.exports = router;
