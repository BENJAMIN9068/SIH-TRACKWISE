#!/usr/bin/env node

/**
 * Commit Preparation for Deployment
 * This script helps prepare and commit changes for Vercel deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Preparing Git commit for Vercel deployment...\n');

try {
  // Check if we're in a git repository
  execSync('git status', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Error: This is not a Git repository.');
  console.log('Initialize Git first:');
  console.log('  git init');
  console.log('  git remote add origin <your-repository-url>');
  process.exit(1);
}

// Check for uncommitted changes
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (!status.trim()) {
    console.log('✅ No changes to commit. Your repository is up to date!');
    console.log('\nNext steps:');
    console.log('1. Follow VERCEL_DEPLOYMENT_GUIDE.md');
    console.log('2. Deploy on Vercel dashboard');
    process.exit(0);
  }

  console.log('📝 Found changes to commit:');
  console.log(status);

} catch (error) {
  console.error('❌ Error checking git status:', error.message);
  process.exit(1);
}

// Check if .env is in .gitignore
if (fs.existsSync('.env')) {
  try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('.env')) {
      console.log('⚠️ WARNING: .env file exists but not in .gitignore!');
      console.log('Adding .env to .gitignore to prevent committing secrets...');
      fs.appendFileSync('.gitignore', '\n# Environment variables\n.env\n.env.local\n');
    }
  } catch (error) {
    console.log('⚠️ Warning: Could not check/update .gitignore');
  }
}

console.log('\n🚀 Committing changes for deployment...');

try {
  // Add all files
  console.log('📁 Adding files...');
  execSync('git add .', { stdio: 'inherit' });

  // Create commit with deployment message
  const commitMessage = '🚀 Prepare for Vercel deployment with MongoDB Atlas\n\n- Add production database configuration\n- Update Vercel settings for optimal deployment\n- Add comprehensive deployment guides\n- Fix map GPS tracking and route highlighting\n- Add automated deployment preparation scripts\n- Update environment variable templates';
  
  console.log('💾 Creating commit...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  console.log('\n✅ Changes committed successfully!');

  // Check remote
  try {
    const remotes = execSync('git remote -v', { encoding: 'utf8' });
    if (remotes.includes('origin')) {
      console.log('\n🌐 Ready to push to GitHub:');
      console.log('  git push origin main');
      console.log('\nOr run: npm run push-deploy');
    } else {
      console.log('\n⚠️ No remote repository configured.');
      console.log('Add your GitHub repository:');
      console.log('  git remote add origin <your-repository-url>');
      console.log('  git push -u origin main');
    }
  } catch (error) {
    console.log('\n✅ Commit created. Push when ready:');
    console.log('  git push origin main');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Push to GitHub: git push origin main');
  console.log('2. Go to Vercel dashboard: https://vercel.com/dashboard');
  console.log('3. Import your repository');
  console.log('4. Add environment variables');
  console.log('5. Deploy!');

  console.log('\n📚 Documentation:');
  console.log('- Complete Guide: VERCEL_DEPLOYMENT_GUIDE.md');
  console.log('- Quick Summary: DEPLOYMENT_SUMMARY.md');
  console.log('- Checklist: DEPLOYMENT_CHECKLIST.md');

} catch (error) {
  console.error('\n❌ Error during git operations:', error.message);
  
  if (error.message.includes('nothing to commit')) {
    console.log('✅ No changes to commit. Already up to date!');
  } else {
    console.log('\nTry manually:');
    console.log('  git add .');
    console.log('  git commit -m "Prepare for Vercel deployment"');
    console.log('  git push origin main');
  }
}