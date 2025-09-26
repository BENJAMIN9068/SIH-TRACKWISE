const mongoose = require('mongoose');

const travelHistorySchema = new mongoose.Schema({
  publicUser: { type: mongoose.Schema.Types.ObjectId, ref: 'PublicUser', required: true },
  fromStation: { type: String, required: true },
  toStation: { type: String, required: true },
  busNumber: { type: String },
  journeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey' },
  searchedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  confirmed: { type: Boolean, default: null }, // null = pending, true = traveled, false = didn't travel
  distanceKm: { type: Number, default: 0 },
  searchQuery: { type: String }, // Store the original search query
}, {
  timestamps: true
});

// Index for faster queries
travelHistorySchema.index({ publicUser: 1, searchedAt: -1 });
travelHistorySchema.index({ confirmed: 1, confirmedAt: 1 });

module.exports = mongoose.model('TravelHistory', travelHistorySchema);
