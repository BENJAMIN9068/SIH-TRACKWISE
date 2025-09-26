const StaffUser = require('../models/StaffUser');
const Journey = require('../models/Journey');

describe('Models', () => {
  describe('StaffUser Model', () => {
    it('should create a staff user with valid data', async () => {
      const staffData = {
        username: 'teststaff',
        email: 'staff@test.com',
        password: 'password123',
        employeeId: 'EMP001',
        name: 'Test Staff',
        phone: '1234567890',
        role: 'conductor',
      };

      const staff = new StaffUser(staffData);
      const savedStaff = await staff.save();

      expect(savedStaff._id).toBeDefined();
      expect(savedStaff.username).toBe(staffData.username);
      expect(savedStaff.email).toBe(staffData.email);
      expect(savedStaff.role).toBe(staffData.role);
      expect(savedStaff.password).not.toBe(staffData.password); // Should be hashed
    });

    it('should not create a staff user without required fields', async () => {
      const staff = new StaffUser({});

      let error;
      try {
        await staff.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.username).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should compare passwords correctly', async () => {
      const staffData = {
        username: 'teststaff',
        email: 'staff@test.com',
        password: 'password123',
        employeeId: 'EMP001',
        name: 'Test Staff',
        phone: '1234567890',
        role: 'conductor',
      };

      const staff = new StaffUser(staffData);
      await staff.save();

      const isMatch = await staff.comparePassword('password123');
      const isNotMatch = await staff.comparePassword('wrongpassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Journey Model', () => {
    let staffUser;

    beforeEach(async () => {
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
    });

    it('should create a journey with valid data', async () => {
      const journeyData = {
        staffUser: staffUser._id,
        startingPoint: 'Delhi',
        destination: 'Mumbai',
        route: 'NH1',
        busNumber: 'DL01AB1234',
        driverName: 'John Doe',
        conductorName: 'Jane Doe',
      };

      const journey = new Journey(journeyData);
      const savedJourney = await journey.save();

      expect(savedJourney._id).toBeDefined();
      expect(savedJourney.startingPoint).toBe(journeyData.startingPoint);
      expect(savedJourney.destination).toBe(journeyData.destination);
      expect(savedJourney.status).toBe('starting');
    });

    it('should update journey location', async () => {
      const journey = new Journey({
        staffUser: staffUser._id,
        startingPoint: 'Delhi',
        destination: 'Mumbai',
        route: 'NH1',
        busNumber: 'DL01AB1234',
        driverName: 'John Doe',
        conductorName: 'Jane Doe',
      });
      await journey.save();

      journey.currentLocation = {
        type: 'Point',
        coordinates: [77.209, 28.6139], // Delhi coordinates
      };
      journey.path.push({
        coordinates: [77.209, 28.6139],
        timestamp: new Date(),
      });

      const updatedJourney = await journey.save();

      expect(updatedJourney.currentLocation.coordinates).toEqual([77.209, 28.6139]);
      expect(updatedJourney.path).toHaveLength(1);
    });
  });
});
