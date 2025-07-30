// Example Firebase configuration
// Copy this to firebase-config.js and update with your actual values

export const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};

// Instructions for Firebase setup:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Click "Add app" and select Web app
// 4. Register your app with a nickname
// 5. Copy the config object above
// 6. Replace the placeholder values with your actual config
// 7. Enable Firestore Database in the Firebase console
// 8. Set up security rules for Firestore

// Firestore Security Rules (add to Firebase console):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
*/ 