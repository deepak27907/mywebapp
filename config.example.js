// Example configuration file
// Copy this to .env and fill in your actual values

export const config = {
  // Google Gemini API
  geminiApiKey: 'your_gemini_api_key_here',
  
  // Firebase Configuration
  firebase: {
    apiKey: 'your_firebase_api_key_here',
    authDomain: 'your_project.firebaseapp.com',
    projectId: 'your_project_id',
    storageBucket: 'your_project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your_app_id_here'
  }
};

// Instructions:
// 1. Create a .env file in the root directory
// 2. Add the following variables:
//
// VITE_GEMINI_API_KEY=your_gemini_api_key_here
// VITE_FIREBASE_API_KEY=your_firebase_api_key_here
// VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
// VITE_FIREBASE_PROJECT_ID=your_project_id
// VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
// VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
// VITE_FIREBASE_APP_ID=your_app_id_here
//
// 3. Replace the placeholder values with your actual API keys 