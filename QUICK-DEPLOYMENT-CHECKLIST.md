# ✅ TrackWise - Quick cPanel Deployment Checklist

## 🚀 Pre-Upload Checklist
- [ ] Fixed MongoDB connection string ✅ (Already done)
- [ ] Reviewed all files are ready for upload
- [ ] Have cPanel login credentials ready
- [ ] Domain is pointed to hosting account

## 📂 Files to Upload (All Required)
```
📁 Your Project Root/
├── 📄 app.js (Main entry point)
├── 📄 package-cpanel.json (Rename to package.json)
├── 📄 .env.cpanel-production (Rename to .env)
├── 📄 server.js
├── 📁 views/ (All EJS templates)
├── 📁 public/ (Static files + .htaccess)
├── 📁 routes/ (All route files)
├── 📁 models/ (Database models)
├── 📁 config/ (Configuration files)
├── 📁 controllers/ (Controllers)
├── 📁 scripts/ (Migration scripts)
├── 📁 utils/ (Utility functions)
└── 📄 CPANEL-DEPLOYMENT-GUIDE.md (This guide)
```

## 🖥️ cPanel Setup (5-Minute Process)

### Step 1: Create Node.js App
- [ ] Go to cPanel → Node.js Selector
- [ ] Click "Create Application"
- [ ] Set startup file: `app.js`
- [ ] Choose Node.js version 14+ or latest
- [ ] Click Create

### Step 2: Upload Files
- [ ] Open File Manager in cPanel
- [ ] Navigate to your app directory
- [ ] Upload ALL project files
- [ ] Extract if uploaded as ZIP

### Step 3: Configure Files
- [ ] Rename `package-cpanel.json` → `package.json`
- [ ] Rename `.env.cpanel-production` → `.env`
- [ ] Edit `.env` file - update domain name:
  ```
  CORS_ORIGINS=https://YOURDOMAIN.com,https://www.YOURDOMAIN.com
  ```

### Step 4: Install Dependencies
- [ ] In Node.js Selector, click your app
- [ ] Click "Run NPM Install"
- [ ] Wait for installation (2-3 minutes)

### Step 5: Setup Database
- [ ] Open Terminal in cPanel (or use SSH)
- [ ] Navigate to app directory
- [ ] Run: `node scripts/migrate-database.js`
- [ ] Verify success message appears

### Step 6: Start Application
- [ ] In Node.js Selector, click "Start"
- [ ] Check status shows "Running"
- [ ] Test your website!

## 🌐 Test Your Deployment
- [ ] Homepage: `https://yourdomain.com`
- [ ] Admin login: `https://yourdomain.com/auth/admin/login`
- [ ] Health check: `https://yourdomain.com/health`

## 🔑 Default Login Credentials
```
Admin: admin / admin123
Staff: COND001 / conductor123
```
**⚠️ CHANGE THESE AFTER FIRST LOGIN!**

## 🆘 If Something Goes Wrong
1. Check application logs in cPanel
2. Verify `.env` file has correct MongoDB URI
3. Ensure all files were uploaded
4. Try restarting the Node.js application
5. Check the full deployment guide: `CPANEL-DEPLOYMENT-GUIDE.md`

## 🎉 Success!
If you see your homepage load correctly, congratulations! Your TrackWise Bus Tracking System is now live on cPanel hosting!

---

**Need help?** Check the full deployment guide or contact your hosting provider for Node.js support.