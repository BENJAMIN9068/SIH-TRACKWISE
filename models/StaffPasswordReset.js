const mongoose = require('mongoose');

const staffPasswordResetSchema = new mongoose.Schema({
  conductorId: {
    type: String,
    required: true,
    trim: true
  },
  conductorName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
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

module.exports = mongoose.model('StaffPasswordReset', staffPasswordResetSchema);