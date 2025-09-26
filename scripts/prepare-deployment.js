#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * This script helps prepare the project for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Preparing Bus Tracking System for Vercel Deployment...\n');

// Check if we're in the correct directory
const requiredFiles = ['package.json', 'server.js', 'vercel.json'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Error: Missing required files:', missingFiles.join(', '));
  console.error('Make sure you\'re running this script from the project root directory.');
  process.exit(1);
}

// Check package.json
console.log('📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Verify required dependencies
const requiredDeps = ['express', 'mongoose', 'ejs', 'socket.io', 'dotenv'];
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
  console.warn('⚠️ Warning: Missing recommended dependencies:', missingDeps.join(', '));
  console.log('Run: npm install', missingDeps.join(' '));
}

// Check Node.js version requirement
if (!packageJson.engines || !packageJson.engines.node) {
  console.log('📝 Adding Node.js version requirement to package.json...');
  packageJson.engines = { ...packageJson.engines, node: '>=18.0.0' };
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
}

console.log('✅ package.json looks good!');

// Check vercel.json
console.log('\n⚙️ Checking vercel.json...');
if (fs.existsSync('vercel.json')) {
  console.log('✅ vercel.json exists!');
} else {
  console.log('❌ vercel.json not found! Please make sure it exists.');
  process.exit(1);
}

// Generate session secret if needed
console.log('\n🔐 Checking environment variables...');
let envExample = '';
if (fs.existsSync('.env.example')) {
  envExample = fs.readFileSync('.env.example', 'utf8');
  console.log('✅ .env.example found!');
} else {
  console.log('❌ .env.example not found!');
}

// Generate a secure session secret
const sessionSecret = crypto.randomBytes(64).toString('hex');
console.log('🔑 Generated secure session secret (use this in your environment variables):');
console.log(`SESSION_SECRET=${sessionSecret}\n`);

// Create deployment checklist
const checklist = `
📋 DEPLOYMENT CHECKLIST

□ MongoDB Atlas Setup:
  □ Created MongoDB Atlas account
  □ Created cluster (M0 Sandbox - Free)
  □ Created database user with read/write permissions
  □ Set network access to allow all IPs (0.0.0.0/0)
  □ Copied connection string

□ Vercel Setup:
  □ Created Vercel account
  □ Connected GitHub repository
  □ Set up environment variables:
    □ MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-tracking?retryWrites=true&w=majority
    □ SESSION_SECRET=${sessionSecret}
    □ ADMIN_ID=your-admin-username
    □ ADMIN_PASS=your-secure-password
    □ NODE_ENV=production
    □ OPENAI_API_KEY=sk-your-openai-key (optional)

□ Testing:
  □ Tested local connection with MongoDB Atlas
  □ All features work locally
  □ Committed and pushed all changes to GitHub

🚀 Ready to deploy!

Next steps:
1. Follow the VERCEL_DEPLOYMENT_GUIDE.md
2. Set up MongoDB Atlas (if not done already)
3. Deploy to Vercel
4. Test the deployed application
`;

console.log(checklist);

// Save checklist to file
fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
console.log('💾 Deployment checklist saved to DEPLOYMENT_CHECKLIST.md');

// Check for common issues
console.log('\n🔍 Checking for common deployment issues...');

// Check for .env in .gitignore
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (!gitignore.includes('.env')) {
    console.log('⚠️ Adding .env to .gitignore...');
    fs.appendFileSync('.gitignore', '\n# Environment variables\n.env\n.env.local\n');
  }
  console.log('✅ .gitignore includes .env');
} else {
  console.log('📝 Creating .gitignore...');
  const gitignoreContent = `
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
.nyc_output

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Vercel
.vercel
`;
  fs.writeFileSync('.gitignore', gitignoreContent.trim());
  console.log('✅ Created .gitignore');
}

// Final recommendations
console.log(`
🎉 Preparation Complete!

📚 Next Steps:
1. Read VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions
2. Set up MongoDB Atlas if you haven't already
3. Test your app locally: npm start
4. Push to GitHub: git add . && git commit -m "Ready for deployment" && git push
5. Deploy on Vercel following the guide

🔗 Useful Links:
- MongoDB Atlas: https://www.mongodb.com/atlas
- Vercel Dashboard: https://vercel.com/dashboard
- Deployment Guide: ./VERCEL_DEPLOYMENT_GUIDE.md

💡 Tips:
- Keep your MongoDB connection string safe
- Use the generated session secret above
- Test thoroughly after deployment
- Monitor your application logs

Good luck! 🍀
`);