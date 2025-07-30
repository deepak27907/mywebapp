# 🚀 Setup Guide - InsideMentor

## 📋 **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Google Cloud account (for Gemini API)
- Firebase account (for authentication)

## 🔧 **Step 1: Get Gemini 2.5 Pro API Key**

### **1.1 Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gemini API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gemini API"
   - Click "Enable"

### **1.2 Get API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key (starts with `AIza...`)

### **1.3 Add to Environment**
Create or update your `.env` file:
```env
VITE_GEMINI_API_KEY=AIzaSyC...your_actual_key_here
```

## 🔥 **Step 2: Set up Firebase Authentication**

### **2.1 Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `insidementor-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

### **2.2 Add Web App**
1. In Firebase console, click "Add app" > "Web"
2. Register app with name: `InsideMentor Web`
3. Copy the Firebase config object

### **2.3 Enable Authentication**
1. Go to "Authentication" > "Sign-in method"
2. Enable "Email/Password"
3. Enable "Anonymous" (optional)

### **2.4 Set up Firestore Database**
1. Go to "Firestore Database"
2. Click "Create database"
3. Start in test mode (for development)
4. Choose location closest to your users

### **2.5 Add Firebase Config**
Update your `.env` file with Firebase config:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 📁 **Step 3: Complete .env File**

Create a `.env` file in your project root:
```env
# Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyC...your_gemini_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC...your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 🔒 **Step 4: Firestore Security Rules**

In Firebase Console > Firestore Database > Rules, add these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks, mood entries, journal entries, and chat messages
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🚀 **Step 5: Test the Setup**

### **5.1 Start the App**
```bash
npm run dev
```

### **5.2 Test Authentication**
1. Go to `http://localhost:5174`
2. Try registering a new student
3. Try logging in with existing credentials

### **5.3 Test AI Features**
1. Login to the app
2. Go to Dashboard - should see AI greeting
3. Add a mood entry - should get AI insights
4. Create tasks - try AI sorting
5. Write journal entries - get AI feedback
6. Chat with AI mentor

## 🔍 **Step 6: Verify Configuration**

Check the status checker in the bottom-right corner:
- ✅ **User:** Should show "Logged In"
- ✅ **AI API:** Should show "Configured"
- ✅ **Firebase:** Should show "Connected"

## 🛠️ **Troubleshooting**

### **AI Not Working**
- Check if `VITE_GEMINI_API_KEY` is set correctly
- Verify the API key is valid in Google AI Studio
- Check browser console for errors

### **Firebase Not Working**
- Verify all Firebase environment variables are set
- Check if Firebase project is created correctly
- Ensure Firestore rules allow read/write

### **Authentication Issues**
- Make sure Firebase Authentication is enabled
- Check if Email/Password sign-in is enabled
- Verify Firestore security rules

## 📊 **Expected Results**

### **With API Keys Configured:**
- ✅ Real AI responses from Gemini 2.5 Pro
- ✅ Firebase authentication and data persistence
- ✅ Real-time data synchronization
- ✅ Secure user data storage

### **Without API Keys (Fallback Mode):**
- ✅ App works with mock data
- ✅ Fallback AI responses
- ✅ Local data storage
- ✅ All features functional

## 🎉 **Success Indicators**

1. **AI Features Working:**
   - Personalized dashboard greetings
   - Mood pattern analysis
   - Smart task prioritization
   - Journal feedback
   - Context-aware AI mentor

2. **Authentication Working:**
   - Student registration and login
   - User data persistence
   - Session management
   - Secure data access

3. **Data Management:**
   - Tasks saved and retrieved
   - Mood entries tracked
   - Journal entries stored
   - Chat history maintained

## 🚀 **Next Steps**

1. **Production Deployment:**
   - Set up proper Firebase security rules
   - Configure custom domain
   - Set up monitoring and analytics

2. **Advanced Features:**
   - Real-time notifications
   - Data export/import
   - Advanced AI analytics
   - Multi-language support

Your InsideMentor app is now ready with real AI and Firebase integration! 🎓✨ 