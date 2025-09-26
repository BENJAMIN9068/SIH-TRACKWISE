const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Import routes and models
const apiRoutes = require('../routes/api');
const Journey = require('../models/Journey');
const StaffUser = require('../models/StaffUser');

// Create express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/api', apiRoutes);

describe('API Routes', () => {
  let staffUser, journey;

  beforeEach(async () => {
    // Create test staff user
    staffUser = new StaffUser({
      username: 'teststaff',
      email: 'staff@test.com',
      password: 'password123',
      employeeId: 'EMP001',
      name: 'Test Staff',
      phone: '1234567890',
      role: 'conductor',
    });
    await staffUser.save();

    // Create test journey
    journey = new Journey({
      staffUser: staffUser._id,
      startingPoint: 'Delhi',
      destination: 'Mumbai',
      route: 'Delhi to Mumbai via NH1',
      highway: 'NH1',
      busNumber: 'DL01AB1234',
      driverName: 'John Doe',
      conductorName: 'Jane Doe',
      status: 'running',
      currentLocation: {
        type: 'Point',
        coordinates: [77.209, 28.6139],
      },
    });
    await journey.save();
  });

  describe('GET /api/search', () => {
    it('should search buses by from and to parameters', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ from: 'Delhi', to: 'Mumbai' })
        .expect(200);

      expect(response.body.buses).toBeDefined();
      expect(response.body.buses).toHaveLength(1);
      expect(response.body.buses[0].startingPoint).toBe('Delhi');
      expect(response.body.buses[0].destination).toBe('Mumbai');
    });

    it('should return 400 if from or to parameters are missing', async () => {
      const response = await request(app).get('/api/search').query({ from: 'Delhi' }).expect(400);

      expect(response.body.error).toBe('From and To parameters are required');
    });

    it('should return empty array if no buses match', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ from: 'Kolkata', to: 'Chennai' })
        .expect(200);

      expect(response.body.buses).toBeDefined();
      expect(response.body.buses).toHaveLength(0);
    });
  });

  describe('GET /api/bus/:id/location', () => {
    it('should get bus location by ID', async () => {
      const response = await request(app).get(`/api/bus/${journey._id}/location`).expect(200);

      expect(response.body.bus).toBeDefined();
      expect(response.body.bus.busNumber).toBe('DL01AB1234');
      expect(response.body.bus.currentLocation.coordinates).toEqual([77.209, 28.6139]);
    });

    it('should return 404 for non-existent bus ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/bus/${fakeId}/location`).expect(404);

      expect(response.body.error).toBe('Bus not found');
    });
  });

  describe('GET /api/buses/active', () => {
    it('should get all active buses', async () => {
      const response = await request(app).get('/api/buses/active').expect(200);

      expect(response.body.buses).toBeDefined();
      expect(response.body.buses).toHaveLength(1);
      expect(response.body.buses[0].status).toBe('running');
    });

    it('should not include completed journeys', async () => {
      // Update journey to completed
      journey.status = 'completed';
      await journey.save();

      const response = await request(app).get('/api/buses/active').expect(200);

      expect(response.body.buses).toHaveLength(0);
    });
  });
});
