#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 InsideMentor Deployment Setup');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('📋 Please edit the .env file with your actual API keys.');
  } else {
    console.log('❌ env.example file not found. Creating basic .env file...');
    
    const envContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Edit the .env file with your actual API keys');
console.log('2. Set up Firebase project (see DEPLOYMENT_GUIDE.md)');
console.log('3. Enable Gemini API (see DEPLOYMENT_GUIDE.md)');
console.log('4. Push to GitHub and deploy to Netlify');
console.log('\n📖 For detailed instructions, see DEPLOYMENT_GUIDE.md');
console.log('\n�� Happy coding!'); 