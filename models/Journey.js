const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
    staffUser: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffUser', required: true },
    startingPoint: { type: String, required: true },
    destination: { type: String, required: true },
    route: { type: String, required: true },
    highway: { type: String },
    busNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    conductorName: { type: String, required: true },
    depot: { type: String },
    status: { type: String, enum: ['starting', 'running', 'completed'], default: 'starting' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    path: [{
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
        timestamp: { type: Date, default: Date.now }
    }]
});

journeySchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Journey', journeySchema);
