#!/usr/bin/env node

/**
 * TrackWise Deployment Setup Script
 * This script helps prepare the application for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚌 TrackWise Deployment Setup');
console.log('================================');

// Check if .env exists
if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found');
    console.log('📋 Creating .env from template...');
    
    if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('✅ .env file created from template');
        console.log('🔧 Please edit .env with your actual values');
    } else {
        console.log('❌ .env.example not found');
    }
} else {
    console.log('✅ .env file exists');
}

// Check package.json
console.log('\n📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredFields = ['name', 'version', 'main', 'scripts', 'dependencies'];
const missingFields = requiredFields.filter(field => !packageJson[field]);

if (missingFields.length === 0) {
    console.log('✅ package.json is complete');
} else {
    console.log('❌ package.json missing fields:', missingFields);
}

// Check if all required dependencies exist
const requiredDeps = [
    'express', 'mongoose', 'ejs', 'bcryptjs', 
    'express-session', 'body-parser', 'cors', 
    'dotenv', 'socket.io'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length === 0) {
    console.log('✅ All required dependencies present');
} else {
    console.log('❌ Missing dependencies:', missingDeps);
}

// Check vercel.json
console.log('\n🔧 Checking Vercel configuration...');
if (fs.existsSync('vercel.json')) {
    console.log('✅ vercel.json exists');
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    if (vercelConfig.builds && vercelConfig.routes) {
        console.log('✅ Vercel configuration looks good');
    } else {
        console.log('⚠️  Vercel configuration may be incomplete');
    }
} else {
    console.log('❌ vercel.json not found');
}

// Check critical files
console.log('\n📁 Checking critical files...');
const criticalFiles = [
    'server.js',
    'views/index.ejs',
    'routes/auth.js',
    'routes/admin.js',
    'routes/staff.js',
    'routes/public.js',
    'models/StaffUser.js',
    'models/PublicUser.js'
];

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

console.log('\n🎯 Deployment Checklist:');
console.log('========================');
console.log('1. ✅ Create GitHub repository');
console.log('2. ✅ Setup MongoDB Atlas cluster');
console.log('3. ✅ Create Vercel account');
console.log('4. ✅ Configure environment variables in Vercel');
console.log('5. ✅ Deploy to Vercel');

console.log('\n🔑 Don\'t forget to set these environment variables in Vercel:');
console.log('- MONGO_URI (MongoDB Atlas connection string)');
console.log('- SESSION_SECRET (long random string)'); 
console.log('- ADMIN_ID (admin username)');
console.log('- ADMIN_PASS (admin password)');
console.log('- NODE_ENV=production');

console.log('\n🚀 Ready for deployment!');
console.log('Follow the README.md for detailed instructions.');