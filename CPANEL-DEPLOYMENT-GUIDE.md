# 🚀 TrackWise Bus Tracking System - cPanel Deployment Guide

## 📋 Prerequisites

Before deploying to cPanel, ensure you have:

- ✅ cPanel hosting account with Node.js support
- ✅ MongoDB Atlas account (free tier available)
- ✅ Domain name pointed to your hosting
- ✅ SSH/Terminal access (optional but recommended)

---

## 🔧 Pre-Deployment Preparation

### Step 1: Update Your MongoDB Connection
Your current MongoDB connection string has been fixed in the deployment files:
```
✅ FIXED: mongodb+srv://bustrackeruser:tm2G89YBUXh5uxzM@bustracker.xxxxx.mongodb.net/bus-tracking?retryWrites=true&w=majority
```

### Step 2: Prepare Files for Upload
Run the preparation script to verify everything is ready:
```bash
node scripts/prepare-cpanel.js
```

---

## 📤 cPanel Deployment Steps

### Step 1: Access cPanel
1. Log into your cPanel hosting account
2. Look for "Node.js Selector" or "Node.js App" in the software section
3. Click on it to manage Node.js applications

### Step 2: Create Node.js Application
1. **Click "Create Application"**
2. **Configure the application:**
   - **Node.js Version:** Select latest available (14.x or higher)
   - **Application Mode:** Production
   - **Application Root:** Leave default or set to `trackwise` (optional)
   - **Application URL:** Your domain or subdomain
   - **Application Startup File:** `app.js`
   - **Application Port:** Leave default (usually auto-assigned)

3. **Click "Create"** - cPanel will set up the Node.js environment

### Step 3: Upload Project Files

#### Option A: File Manager (Recommended for most users)
1. **Open cPanel File Manager**
2. **Navigate** to your application root directory (usually in `public_html` or the path you specified)
3. **Upload and extract** your project files:
   - Upload all files and folders from your project
   - Make sure to include: `app.js`, `package-cpanel.json`, `views/`, `public/`, `routes/`, `models/`, `config/`, `controllers/`

#### Option B: FTP/SFTP
1. Use your preferred FTP client
2. Connect to your hosting account
3. Upload all project files to the application directory

### Step 4: Configure Environment and Dependencies

1. **In Node.js Selector, click on your app**
2. **Rename files:**
   - `package-cpanel.json` → `package.json`
   - `.env.cpanel-production` → `.env`

3. **Edit the `.env` file** and update:
   ```env
   # Update with your actual domain
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   
   # Update MongoDB URI if needed (usually it's already correct)
   MONGO_URI=mongodb+srv://bustrackeruser:tm2G89YBUXh5uxzM@bustracker.xxxxx.mongodb.net/bus-tracking?retryWrites=true&w=majority
   
   # Add your email settings (optional)
   SMTP_HOST=mail.yourdomain.com
   SMTP_USER=noreply@yourdomain.com
   SMTP_PASS=your_email_password
   ```

4. **Install Dependencies:**
   - In Node.js Selector, click **"Run NPM Install"**
   - This will install all required packages
   - Wait for the installation to complete (may take 2-3 minutes)

### Step 5: Database Setup

1. **Run the migration script:**
   ```bash
   node scripts/migrate-database.js
   ```
   
   **Or through cPanel terminal:**
   - Open "Terminal" in cPanel
   - Navigate to your app directory
   - Run: `node scripts/migrate-database.js`

2. **Verify the migration completed successfully** - you should see:
   ```
   🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!
   ```

### Step 6: Start Your Application

1. **In Node.js Selector:**
   - Click on your application
   - Click **"Start"** or **"Restart"** button
   - Wait for the status to show "Started"

2. **Check application logs** for any errors
3. **Access your website** at your domain name

---

## 🌐 Testing Your Deployment

### Test URLs
- **Homepage:** `https://yourdomain.com`
- **Admin Login:** `https://yourdomain.com/auth/admin/login`
- **Staff Portal:** `https://yourdomain.com/auth/staff/login`
- **Public Portal:** `https://yourdomain.com/auth/login`
- **Health Check:** `https://yourdomain.com/health`

### Default Login Credentials
```
🔑 Admin Login:
Username: admin
Password: admin123

👨‍🔧 Sample Staff Logins:
Conductor: COND001 / conductor123
Driver: DRV001 / driver123
```

**⚠️ IMPORTANT:** Change these passwords after first login!

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
**Check:**
- Node.js version is 14.x or higher
- `app.js` exists and is the correct startup file
- All dependencies are installed
- `.env` file exists with correct MongoDB URI

**Solution:**
```bash
# Check application logs in cPanel
# Or restart the application
```

#### 2. Database Connection Errors
**Check:**
- MongoDB Atlas cluster is running
- IP whitelist includes your hosting IP (or set to 0.0.0.0/0)
- Connection string is correct
- Database user has proper permissions

**Solution:**
```bash
# Test connection manually:
node scripts/migrate-database.js
```

#### 3. 404 Errors on Routes
**Check:**
- `.htaccess` file is in the `public` directory
- URL rewriting is enabled
- Application is running on correct port

#### 4. Socket.IO Connection Issues
**Check:**
- Your hosting supports WebSocket connections
- CORS origins are correctly set
- No firewall blocking WebSocket traffic

#### 5. Static Files Not Loading
**Check:**
- `public` directory is accessible
- File permissions are correct (755 for directories, 644 for files)
- `.htaccess` file is properly configured

### Getting Help

1. **Check application logs** in cPanel Node.js Selector
2. **Enable debug mode** temporarily:
   ```env
   DEBUG_MODE=true
   VERBOSE_LOGGING=true
   ```
3. **Contact your hosting provider** if Node.js features aren't working

---

## 🚀 Post-Deployment Checklist

### Immediate Tasks
- [ ] Test all login portals (admin, staff, public)
- [ ] Change default passwords
- [ ] Create your first bus route
- [ ] Add real staff members
- [ ] Test GPS tracking functionality

### Security Setup
- [ ] Update admin credentials
- [ ] Configure email notifications
- [ ] Set up SSL certificate (HTTPS)
- [ ] Review user permissions
- [ ] Test backup procedures

### Performance Optimization
- [ ] Enable GZIP compression
- [ ] Configure CDN (if needed)
- [ ] Monitor application performance
- [ ] Set up log rotation
- [ ] Configure monitoring alerts

---

## 📞 Support & Maintenance

### Regular Maintenance
- **Weekly:** Check application logs
- **Monthly:** Update dependencies
- **Quarterly:** Review security settings
- **As needed:** Database backups

### Updates
To update your application:
1. Upload new files via File Manager/FTP
2. Run `npm install` if dependencies changed
3. Restart the Node.js application
4. Test functionality

---

## 🎉 Congratulations!

Your TrackWise Bus Tracking System is now live on cPanel hosting! 

**Next Steps:**
1. Configure your bus routes and schedules
2. Add staff members and assign roles
3. Set up real-time GPS tracking
4. Train users on the system
5. Monitor and maintain regularly

**For technical support:** Check the application logs and refer to the troubleshooting section above.

---

## 📊 System URLs Quick Reference

```
🏠 Homepage:           https://yourdomain.com
👨‍💼 Admin Portal:       https://yourdomain.com/auth/admin/login
👨‍🔧 Staff Portal:       https://yourdomain.com/auth/staff/login
👤 Public Portal:      https://yourdomain.com/auth/login
🔧 Health Check:       https://yourdomain.com/health
📊 Debug Info:         https://yourdomain.com/debug/health
```

**Happy tracking! 🚌📍**