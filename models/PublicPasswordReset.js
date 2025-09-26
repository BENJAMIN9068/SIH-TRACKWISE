const mongoose = require('mongoose');

const publicPasswordResetSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: String // Admin username
  },
  newPassword: {
    type: String // Generated password
  },
  notes: {
    type: String // Admin notes
  }
});

module.exports = mongoose.model('PublicPasswordReset', publicPasswordResetSchema);