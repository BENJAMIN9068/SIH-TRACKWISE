# 🚌 Bus Tracking System

A comprehensive web-based bus tracking system with three distinct interfaces: **Staff**, **Admin**, and **Public**. This system enables real-time GPS tracking, route management, and live bus location monitoring across Indian highways and routes.

## 🌟 Features

### 📋 Main Features
- **Three Access Levels**: Staff, Administration, and Public portals
- **Real-time GPS Tracking**: Live location updates every 30 seconds
- **Interactive Maps**: Indian map integration using Leaflet and OpenStreetMap
- **Journey Management**: Complete bus journey lifecycle tracking
- **User Authentication**: Secure login/registration for staff and public users
- **Admin Dashboard**: Comprehensive monitoring and management tools

### 👥 Staff Interface (`/staff`)
- **Login/Registration**: Secure authentication for conductors and drivers
- **Journey Creation**: Form to enter:
  - Starting Point of journey
  - Destination
  - Route information
  - Highway details
  - Bus Number
  - Driver Name
  - Conductor Name
  - Bus Depot
- **GPS Integration**: Real-time location tracking with user permission
- **Live Map Display**: Shows current location and route on Indian map
- **Journey Management**: Update journey status and track progress

### 🛡️ Admin Interface (`/admin`)
- **Secure Login**: Hardcoded credentials (ID: `BCS2024261`, Pass: `BCS2024261`)
- **Dashboard** (`/admin/dashboard`): Statistics overview
  - Running buses count
  - Starting journeys
  - Completed journeys
  - Total staff and public users
- **Live Buses** (`/admin/live-buses`): Real-time bus tracking
- **Staff Database** (`/admin/staff-db`): Registered staff management
- **Public Database** (`/admin/public-db`): Public user management
- **Buses Map** (`/admin/buses-running`): Live map with all running buses

### 🌍 Public Interface (`/public`)
- **User Registration/Login**: Separate database for public users
- **Bus Search**: Find buses between two stations
  - "From Station" and "Destination" search
  - Shows available buses with routes
  - Displays buses passing through nearby routes
- **Live Tracking**: View real-time bus locations
- **Route Information**: Highway and route details (without driver/conductor names)

## 🏗️ Technical Architecture

### Backend Stack
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **bcryptjs** for password hashing
- **express-session** for session management
- **Socket.IO** for real-time updates

### Frontend Stack
- **EJS** templating engine
- **Bootstrap 5** for responsive UI
- **Leaflet** with **OpenStreetMap** for mapping
- **Font Awesome** icons
- **Vanilla JavaScript** for interactivity

### Database Schema
- **StaffUser**: Employee authentication and profiles
- **PublicUser**: Public user accounts (separate database)
- **Journey**: Bus journey tracking with GPS coordinates

## 📁 Project Structure

```
bus-tracking-system/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── models/                   # Database models
│   ├── StaffUser.js         # Staff user schema
│   ├── PublicUser.js        # Public user schema
│   └── Journey.js           # Journey tracking schema
├── routes/                   # Route handlers
│   ├── auth.js              # Authentication routes
│   ├── staff.js             # Staff interface routes
│   ├── admin.js             # Admin interface routes
│   ├── public.js            # Public interface routes
│   └── api.js               # API endpoints
├── views/                    # EJS templates
│   ├── index.ejs            # Main homepage
│   ├── staff/               # Staff interface views
│   ├── admin/               # Admin interface views
│   ├── public/              # Public interface views
│   └── partials/            # Reusable components
├── public/                   # Static assets
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/                  # Client-side JavaScript
│   └── images/              # Image assets
├── controllers/              # Business logic controllers
├── middleware/               # Custom middleware
└── config/                   # Configuration files
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local or cloud instance)
- **Git** (optional)

### Step 1: Install Dependencies
```bash
cd bus-tracking-system
npm install
```

### Step 2: Configure Environment
Update the `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/bus-tracking
SESSION_SECRET=your_secret_key
ADMIN_ID=BCS2024261
ADMIN_PASS=BCS2024261
```

### Step 3: Start MongoDB
Make sure MongoDB is running on your system.

### Step 4: Run the Application
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

### Step 5: Access the Application
Open your browser and navigate to `http://localhost:3000`

## 🔐 Default Credentials

### Admin Access
- **URL**: `/admin`
- **ID**: `BCS2024261`
- **Password**: `BCS2024261`

### Staff & Public
Users need to register through their respective interfaces.

## 📱 Features Breakdown

### 🗺️ GPS & Mapping
- **Real-time Location**: Continuous GPS tracking with user permission
- **Indian Map**: Focused on Indian geography and highways
- **Route Display**: Visual route representation on maps
- **Live Updates**: Location updates every 30 seconds
- **Bus Icons**: Custom bus markers on maps

### 🔍 Search & Filtering
- **Route Matching**: Intelligent route matching algorithm
- **Partial Matches**: Shows buses passing through nearby routes
- **Real-time Availability**: Only shows active/running buses
- **Multiple Criteria**: Search by starting point, destination, route, and highway

### 📊 Dashboard & Analytics
- **Live Statistics**: Real-time bus counts and journey status
- **User Management**: Staff and public user databases
- **Journey History**: Complete journey lifecycle tracking
- **Status Updates**: Starting → Running → Completed workflow

## 🌐 API Endpoints

### Authentication
- `POST /auth/staff/login` - Staff login
- `POST /auth/staff/register` - Staff registration
- `POST /auth/public/login` - Public login
- `POST /auth/public/register` - Public registration
- `POST /auth/admin/login` - Admin login
- `POST /auth/logout` - Logout

### Staff
- `GET /staff/dashboard` - Staff dashboard
- `GET /staff/journey` - Journey creation form
- `POST /staff/journey` - Create new journey
- `POST /staff/location/update` - Update GPS location

### Admin
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/live-buses` - Live bus tracking
- `GET /admin/staff-db` - Staff database
- `GET /admin/public-db` - Public user database
- `GET /admin/buses-running` - Buses map

### Public API
- `GET /api/search?from=&to=` - Search buses
- `GET /api/bus/:id/location` - Get bus location
- `GET /api/buses/active` - Get all active buses

## 🛠️ Development

### Adding New Features
1. Create new routes in `/routes/`
2. Add database models in `/models/`
3. Create EJS templates in `/views/`
4. Add client-side JavaScript in `/public/js/`

### Database Models
- **StaffUser**: Employee management with roles (conductor/driver)
- **PublicUser**: Public user accounts with separate storage
- **Journey**: Complete journey tracking with GPS coordinates and path history

### Security Features
- Password hashing with bcryptjs
- Session-based authentication
- Admin credential verification
- Input validation and sanitization

## 📝 Usage Guide

### For Staff (Conductors/Drivers)
1. Register with employee ID and role
2. Login to access dashboard
3. Create new journey with all required details
4. Allow GPS access for location tracking
5. Journey automatically updates location every 30 seconds

### For Admins
1. Login with hardcoded credentials
2. Monitor all active buses on dashboard
3. View detailed journey information
4. Manage staff and public user databases
5. Use live map to track all buses simultaneously

### For Public Users
1. Register and login to access system
2. Search for buses between two stations
3. View available buses with route details
4. Track live bus locations on map
5. See highlighted routes and highways

## 🔧 Troubleshooting

### Common Issues
1. **GPS not working**: Ensure HTTPS or localhost for geolocation
2. **Maps not loading**: Check internet connection for tile loading
3. **Database connection**: Verify MongoDB is running
4. **Session issues**: Clear browser cookies/localStorage

### Development Tips
- Use `npm run dev` for hot reloading
- Check browser console for JavaScript errors
- Monitor server logs for backend issues
- Test with multiple browser tabs for different user types

## 🚀 Deployment

### Environment Setup
- Set NODE_ENV=production
- Configure MongoDB connection string
- Update session secret for security
- Enable HTTPS for GPS functionality

### Recommended Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **DigitalOcean**: VPS with MongoDB
- **AWS/Azure**: Cloud deployment options

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for efficient bus tracking and management in India**
