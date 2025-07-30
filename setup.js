import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 InsideMentor AI Setup');
console.log('========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
}

console.log('\n📋 Next Steps:');
console.log('1. Get your Google Gemini API key from: https://makersuite.google.com/app/apikey');
console.log('2. Create a Firebase project at: https://console.firebase.google.com/');
console.log('3. Enable Firestore Database in your Firebase project');
console.log('4. Add your web app to Firebase and copy the configuration');
console.log('5. Update the .env file with your actual API keys');
console.log('6. Run: npm run dev');

console.log('\n🔧 Dependencies Status:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  if (dependencies['@google/generative-ai']) {
    console.log('✅ @google/generative-ai installed');
  } else {
    console.log('❌ @google/generative-ai missing - run: npm install @google/generative-ai');
  }
  
  if (dependencies['firebase']) {
    console.log('✅ firebase installed');
  } else {
    console.log('❌ firebase missing - run: npm install firebase');
  }
} catch (error) {
  console.log('❌ Error reading package.json');
}

console.log('\n🎉 Setup complete! Follow the steps above to configure your API keys.'); 