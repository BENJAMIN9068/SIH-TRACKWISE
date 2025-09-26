const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['staff', 'public'],
    required: true
  },
  userId: {
    type: String,
    required: true // This will store employeeId for staff or username for public users
  },
  purpose: {
    type: String,
    enum: ['password_reset', 'account_verification'],
    default: 'password_reset'
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 // Maximum 3 attempts allowed
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from creation
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for automatic deletion of expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create compound index for faster queries
otpSchema.index({ email: 1, userType: 1, purpose: 1 });
otpSchema.index({ userId: 1, userType: 1, purpose: 1 });

// Instance method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Instance method to check if max attempts reached
otpSchema.methods.isMaxAttemptsReached = function() {
  return this.attempts >= 3;
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function(email, otp, userType, purpose = 'password_reset') {
  return this.findOne({
    email,
    otp,
    userType,
    purpose,
    verified: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 }
  });
};

// Static method to cleanup expired OTPs
otpSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('OTP', otpSchema);