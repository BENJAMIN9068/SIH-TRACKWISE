<<<<<<< HEAD
# 🚌 TrackWise - Smart Bus Tracking System

A comprehensive bus tracking system with real-time GPS tracking, AI-powered assistance, and multiple user portals for staff, admin, and public users.

## 🌟 Features

### 🔐 **Multi-Role Authentication**
- **Staff Portal**: Conductor login with predefined IDs
- **Admin Panel**: Complete system management
- **Public Access**: User registration and bus searching

### 📊 **Travel Management**
- Real-time bus tracking with GPS
- Comprehensive travel history
- Distance calculation and statistics
- Bus search confirmation system

### 🛡️ **Admin Features**
- Password reset request management
- Staff and public user databases
- Live bus monitoring
- System analytics and reporting

### 🎯 **User Experience**
- Responsive design for all devices
- AI-powered chatbot assistance
- Real-time notifications
- Interactive maps with bus locations

## 🚀 Quick Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- MongoDB Atlas account (free tier available)

### Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel
5. Get your connection string: `mongodb+srv://username:password@cluster0.mongodb.net/bus-tracking?retryWrites=true&w=majority`

### Step 2: Deploy to GitHub

1. **Create a new GitHub repository:**
   ```bash
   # Navigate to your project directory
   cd bus-tracking-system
   
   # Initialize git (if not already initialized)
   git init
   
   # Add all files
   git add .
   
   # Commit files
   git commit -m "Initial commit: TrackWise Bus Tracking System"
   
   # Add your GitHub repository as remote
   git remote add origin https://github.com/yourusername/bus-tracking-system.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**
   In Vercel dashboard, add these environment variables:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/bus-tracking?retryWrites=true&w=majority
   SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-random
   ADMIN_ID=admin2024
   ADMIN_PASS=your-secure-admin-password-2024
   NODE_ENV=production
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-app-name.vercel.app`

## 🎯 User Access

### 👥 **Staff Portal** (`/staff`)
**Predefined Conductor Accounts:**
- **ID:** BCS2024100 | **Password:** 1234567
- **ID:** BCS2024101 | **Password:** 1234567
- **ID:** BCS2024102 | **Password:** 234568
- **ID:** BCS2024103 | **Password:** 345678
- **ID:** BCS2024104 | **Password:** 456789
- **ID:** BCS2024105 | **Password:** 567890
- **ID:** BCS2024106 | **Password:** 678901
- **ID:** BCS2024107 | **Password:** 789012
- **ID:** BCS2024108 | **Password:** 890123
- **ID:** BCS2024109 | **Password:** 901234
- **ID:** BCS2024110 | **Password:** 012345

### 🛡️ **Admin Panel** (`/admin`)
- **ID:** admin2024 (or your custom ADMIN_ID)
- **Password:** your-secure-admin-password-2024 (or your custom ADMIN_PASS)

### 🌐 **Public Access** (`/public`)
- Registration available for public users
- Password reset through admin approval

## 🔧 Local Development

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/bus-tracking-system.git
   cd bus-tracking-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Seed conductor data:**
   ```bash
   npm run seed-conductors
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🛠️ **Tech Stack**

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** EJS templates, Bootstrap 5
- **Real-time:** Socket.IO
- **Maps:** Leaflet.js
- **Authentication:** bcryptjs, express-session
- **Deployment:** Vercel, MongoDB Atlas

## 📝 **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ Yes |
| `SESSION_SECRET` | Secret key for sessions | ✅ Yes |
| `ADMIN_ID` | Admin login ID | ✅ Yes |
| `ADMIN_PASS` | Admin password | ✅ Yes |
| `PORT` | Server port (default: 3000) | ❌ No |
| `NODE_ENV` | Environment (production/development) | ❌ No |

## 🐛 **Troubleshooting**

### Common Issues:

1. **MongoDB Connection Error:**
   - Verify your MONGO_URI is correct
   - Ensure IP whitelist includes 0.0.0.0/0 for Vercel
   - Check MongoDB Atlas cluster is running

2. **Environment Variables Not Loading:**
   - Make sure .env file exists locally
   - Verify all variables are set in Vercel dashboard
   - Check variable names match exactly

3. **Session Issues:**
   - Ensure SESSION_SECRET is set
   - Clear browser cookies and try again

4. **Build/Deployment Errors:**
   - Check all dependencies are in package.json
   - Verify Node.js version compatibility
   - Review Vercel build logs

## 📄 **License**

This project is licensed under the MIT License.

---

**🎉 Ready to Deploy! Follow the steps above to get your TrackWise system live on Vercel! 🚌**
=======
# SIH-TRACKWISE
>>>>>>> eacd2b360639f61b772d168c10a86e50c19c5cdd
