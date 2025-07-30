import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupFirebase() {
  console.log('🔥 Firebase & AI Service Setup\n');
  
  console.log('📋 Please provide your configuration details:');
  console.log('(Press Enter to skip any field you don\'t have yet)\n');
  
  const geminiApiKey = await question('🔑 Gemini API Key: ');
  const firebaseApiKey = await question('🔥 Firebase API Key: ');
  const firebaseAuthDomain = await question('🌐 Firebase Auth Domain: ');
  const firebaseProjectId = await question('📁 Firebase Project ID: ');
  const firebaseStorageBucket = await question('📦 Firebase Storage Bucket: ');
  const firebaseMessagingSenderId = await question('📱 Firebase Messaging Sender ID: ');
  const firebaseAppId = await question('🆔 Firebase App ID: ');
  
  const envContent = `# Google Gemini API
VITE_GEMINI_API_KEY=${geminiApiKey || 'your_gemini_api_key_here'}

# Firebase Configuration
VITE_FIREBASE_API_KEY=${firebaseApiKey || 'your_firebase_api_key_here'}
VITE_FIREBASE_AUTH_DOMAIN=${firebaseAuthDomain || 'your_project.firebaseapp.com'}
VITE_FIREBASE_PROJECT_ID=${firebaseProjectId || 'your_project_id'}
VITE_FIREBASE_STORAGE_BUCKET=${firebaseStorageBucket || 'your_project.appspot.com'}
VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseMessagingSenderId || '123456789'}
VITE_FIREBASE_APP_ID=${firebaseAppId || 'your_app_id_here'}
`;

  fs.writeFileSync('.env', envContent);
  
  console.log('\n✅ .env file created successfully!');
  
  if (!geminiApiKey || !firebaseApiKey) {
    console.log('\n⚠️  Some values are missing. Please update your .env file with the actual values:');
    console.log('   - Get Gemini API key from: https://makersuite.google.com/app/apikey');
    console.log('   - Get Firebase config from: https://console.firebase.google.com/');
  } else {
    console.log('\n🎉 Setup complete! You can now run: npm run dev');
  }
  
  console.log('\n📖 Next steps:');
  console.log('   1. Update .env file with your actual API keys');
  console.log('   2. Set up Firebase security rules (see FIREBASE_SETUP_FIX.md)');
  console.log('   3. Enable Authentication in Firebase Console');
  console.log('   4. Run: npm run dev');
  
  rl.close();
}

setupFirebase().catch(console.error); 