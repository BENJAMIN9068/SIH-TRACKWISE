# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Starting the Application
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

### Dependencies
```bash
# Install all dependencies
npm install

# Main dependencies are Express.js, MongoDB/Mongoose, EJS templating, Socket.IO for real-time updates
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a single test file
npm test tests/models.test.js
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is formatted
npm run format:check
```

### Database Setup
Ensure MongoDB is running before starting the app. Default connection is `mongodb://localhost:27017/bus-tracking`.
For testing, a separate test database `bus-tracking-test` is used.

### Testing & Validation
- **Jest** test framework with **Supertest** for API testing
- Test files in `/tests` directory with `.test.js` extension
- Tests cover models, API routes, and core functionality
- Manual testing via the three interfaces: `/staff`, `/admin`, `/public`
- Admin credentials: ID `BCS2024261`, Password `BCS2024261`

## Architecture Overview

### Multi-Interface System
This is a **three-portal bus tracking system** with completely separate user flows:

1. **Staff Interface** (`/staff`) - For conductors and drivers to create journeys and provide GPS tracking
2. **Admin Interface** (`/admin`) - For monitoring all buses, managing users, and viewing analytics  
3. **Public Interface** (`/public`) - For passengers to search and track buses

### Core Models & Data Flow
- **StaffUser**: Conductor/driver profiles with roles and authentication
- **PublicUser**: Separate user database for public passengers
- **Journey**: Central model tracking bus trips with GPS coordinates, path history, and real-time status

Journey status flows: `starting` → `running` → `completed`

### Real-time GPS Architecture
- Staff creates journeys through forms with route details (starting point, destination, highway, bus number, etc.)
- GPS coordinates are continuously updated via `/staff/location/update` endpoint every 30 seconds
- `currentLocation` stores latest GPS point, `path` array stores full route history
- **Socket.IO implemented** for real-time updates across all interfaces
- Location updates automatically broadcast to connected clients
- Room-based updates for journey-specific and admin-specific notifications

### Route-Based Search System
Public users search "from station to destination" which queries journeys using:
- Exact matching on `startingPoint`/`destination` fields
- Regex pattern matching on `route` field for partial matches
- Highway-based matching for buses passing through nearby routes

### Authentication & Sessions
- **Staff/Public**: bcrypt password hashing with express-session
- **Admin**: Hardcoded credentials in environment variables (`ADMIN_ID`, `ADMIN_PASS`)
- Session-based auth with different session keys per user type

### Frontend Structure
- **EJS templating** with Bootstrap 5 for responsive UI
- **Leaflet + OpenStreetMap** for interactive maps focused on Indian geography
- **Font Awesome** icons throughout
- Custom CSS in `/public/css/style.css` with gradient backgrounds and hover effects

## Key Integration Points

### GPS & Mapping
- GPS permission required for location tracking
- Maps centered on India (lat: 20.5937, lng: 78.9629)  
- Real-time location updates every 30 seconds when journeys are active

### Database Relationships
- Journey documents reference StaffUser via ObjectId
- Admin can view/manage both StaffUser and PublicUser collections
- Journey path tracking stores coordinate arrays with timestamps

### API Endpoints Structure
Routes are organized by user type:
- `/auth/*` - Authentication for all user types
- `/staff/*` - Staff journey management and GPS updates
- `/admin/*` - Administrative dashboards and user management
- `/public/*` - Public search and tracking interfaces
- `/api/*` - Public API endpoints for bus searches and location data

## Development Notes

### Environment Configuration
Key environment variables in `.env`:
- `MONGO_URI` - Database connection string
- `SESSION_SECRET` - Session encryption key
- `ADMIN_ID` / `ADMIN_PASS` - Admin login credentials
- `PORT` - Server port (default 3000)

### Security Considerations
- Passwords are hashed with bcryptjs before storage
- Session management for user authentication state
- Input validation needed for route/GPS coordinate updates
- HTTPS required in production for GPS geolocation API

### Real-time Features Implementation
- **Socket.IO fully implemented** for live location updates
- Client-side JavaScript class (`BusTracker`) handles real-time map updates
- Automatic GPS tracking with `navigator.geolocation.watchPosition`
- Real-time dashboard updates for admin interface
- Location updates broadcast to:
  - General `locationUpdate` events for all clients
  - Journey-specific rooms (`journey_${journeyId}`)
  - Admin room for administrative monitoring

### Client-Side Real-time Features
- `/public/js/realtime.js` provides `BusTracker` class
- Automatic map marker updates when buses move
- Live status indicators and timestamp updates
- GPS tracking initialization for staff interfaces
- Room-based Socket.IO connections for targeted updates
