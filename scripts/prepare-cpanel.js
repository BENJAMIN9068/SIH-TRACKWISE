#!/usr/bin/env node

/**
 * cPanel Deployment Preparation Script
 * Prepares files for quick cPanel upload
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing Bus Tracking System for cPanel...\n');

// Your corrected MongoDB connection string
const CORRECTED_MONGO_URI = 'mongodb+srv://bustrackeruser:tm2G89YBUXh5uxzM@bustracker.xxxxx.mongodb.net/bus-tracking?retryWrites=true&w=majority';

console.log('✅ Fixed your MongoDB connection string:');
console.log('❌ Original: mongodb+srv://bustrackeruser:tm2G89YBUXh5uxzM@@bustracker.xxxxx.mongodb.net/bustrackeruser?retryWrites=true&w=majority');
console.log('✅ Fixed:    ' + CORRECTED_MONGO_URI);
console.log('   • Removed extra @ symbol');
console.log('   • Changed database name to "bus-tracking"\n');

// Create production .env for cPanel
const envContent = `# cPanel Production Environment
MONGO_URI=${CORRECTED_MONGO_URI}
SESSION_SECRET=bus-tracking-secret-key-2024-super-secure-production
ADMIN_ID=admin
ADMIN_PASS=admin123
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
`;

try {
  fs.writeFileSync('.env.cpanel-ready', envContent);
  console.log('✅ Created .env.cpanel-ready with your corrected settings');
} catch (error) {
  console.error('❌ Could not create .env file:', error.message);
}

// Check required files
const requiredFiles = [
  'app.js',
  'package-cpanel.json',
  'views',
  'public',
  'routes',
  'controllers',
  'models',
  'config'
];

console.log('\n📁 Checking required files for upload:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(exists ? `✅ ${file}` : `❌ ${file} (MISSING)`);
});

console.log('\n🎯 READY FOR cPANEL UPLOAD!');
console.log('\nNext Steps:');
console.log('1. Login to your cPanel');
console.log('2. Go to Node.js Selector');
console.log('3. Create new app with startup file: app.js');
console.log('4. Upload ALL your project files');
console.log('5. Rename: package-cpanel.json → package.json');
console.log('6. Rename: .env.cpanel-ready → .env');
console.log('7. Run NPM Install');
console.log('8. START your app');

console.log('\n🌐 Test URLs after deployment:');
console.log('• Homepage: https://yourdomain.com');
console.log('• Admin: https://yourdomain.com/auth/admin/login');
console.log('• Debug: https://yourdomain.com/debug/health');

console.log('\n👨‍💼 Admin Login:');
console.log('• Username: admin');
console.log('• Password: admin123');

console.log('\n🎉 Your Bus Tracking System will be LIVE!');