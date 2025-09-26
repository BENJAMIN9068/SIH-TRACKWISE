#!/usr/bin/env node

/**
 * Vercel Deployment Troubleshooting Script
 * Fixes common deployment issues, especially MongoDB connection problems
 */

const fs = require('fs');

console.log('🚨 Vercel Deployment Troubleshooting\n');

console.log('📋 Common fixes for DNS_HOSTNAME_NOT_FOUND error:\n');

console.log('1️⃣  CHECK MONGODB ATLAS CONNECTION STRING');
console.log('   ❌ Wrong: mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true');
console.log('   ✅ Right: mongodb+srv://username:password@cluster.abcde.mongodb.net/bus-tracking?retryWrites=true&w=majority');
console.log('   🔍 Key points:');
console.log('      • Must include the full cluster hostname (with random ID like "abcde")');
console.log('      • Must include database name "bus-tracking" after the hostname');
console.log('      • Password should not contain special characters like @, :, /, ?, #, [, ]');

console.log('\n2️⃣  VERIFY VERCEL ENVIRONMENT VARIABLES');
console.log('   Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables');
console.log('   Check that MONGO_URI is set for "Production" environment');

console.log('\n3️⃣  CHECK MONGODB ATLAS NETWORK ACCESS');
console.log('   Go to: MongoDB Atlas → Network Access');
console.log('   Ensure you have: 0.0.0.0/0 (Allow access from anywhere)');

console.log('\n4️⃣  VERIFY DATABASE USER PERMISSIONS');
console.log('   Go to: MongoDB Atlas → Database Access');
console.log('   Ensure user has: "Atlas admin" or "Read and write to any database"');

console.log('\n🔧 QUICK FIXES:\n');

// Check if local .env exists to help user
if (fs.existsSync('.env')) {
  console.log('📄 Found local .env file. Here\'s what you should verify:');
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const mongoUri = envContent.match(/MONGO_URI=(.+)/);
    
    if (mongoUri) {
      const uri = mongoUri[1].trim();
      console.log('   Current MONGO_URI format:', uri.substring(0, 50) + '...');
      
      // Check for common issues
      if (!uri.includes('mongodb.net/bus-tracking')) {
        console.log('   ⚠️  Missing database name! Should end with "/bus-tracking"');
      }
      
      if (uri.includes('@cluster.mongodb.net')) {
        console.log('   ⚠️  Missing cluster ID! Should be like "@cluster0.abcde.mongodb.net"');
      }
      
      if (uri.includes('username') || uri.includes('password')) {
        console.log('   ⚠️  Still contains placeholder values!');
      }
    }
  } catch (error) {
    console.log('   Could not read .env file');
  }
} else {
  console.log('📄 No local .env found. Make sure environment variables are set in Vercel!');
}

console.log('\n📝 Step-by-step fix:\n');
console.log('1. Go to MongoDB Atlas → Database → Connect');
console.log('2. Choose "Connect your application"');
console.log('3. Select Node.js driver');
console.log('4. Copy the connection string');
console.log('5. Replace <password> with your actual password');
console.log('6. Add "/bus-tracking" after ".mongodb.net"');
console.log('7. Paste complete string in Vercel environment variables');
console.log('8. Redeploy in Vercel');

console.log('\n🎯 Example of correct connection string:');
console.log('mongodb+srv://bususer:mypassword@cluster0.ab1cd.mongodb.net/bus-tracking?retryWrites=true&w=majority');

console.log('\n🔄 After fixing, redeploy:');
console.log('   • Vercel Dashboard → Your Project → Deployments');
console.log('   • Click "..." on latest deployment → "Redeploy"');
console.log('   • Or push new commit to GitHub for auto-deployment');

console.log('\n📊 Check deployment logs:');
console.log('   • Vercel Dashboard → Your Project → Functions');
console.log('   • Click on server.js function');
console.log('   • Look for MongoDB connection errors');