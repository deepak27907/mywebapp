# 🚀 Quick Start Guide - InsideMentor AI Features

## ✅ What's Already Done

- ✅ All AI features implemented
- ✅ Firebase integration ready
- ✅ Dependencies installed
- ✅ .env file created

## 🔧 Setup Steps (5 minutes)

### 1. Get Google Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Set up Firebase
1. Visit: https://console.firebase.google.com/
2. Create a new project
3. Click "Add app" → "Web app"
4. Register your app (any name)
5. Copy the configuration values

### 3. Update Environment Variables
Edit the `.env` file and replace the placeholder values:

```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Enable Firestore Database
1. In Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location (any is fine)

### 5. Run the Application
```bash
npm run dev
```

## 🎯 AI Features Available

### Dashboard
- **AI Greeting**: Personalized welcome messages
- **Progress Insights**: AI-generated progress analysis
- **Mood Insights**: Pattern recognition from mood data

### Tasks
- **AI Sort**: Intelligent task prioritization
- **Task Breakdown**: Automatic subtask generation

### Journal
- **AI Feedback**: Thoughtful analysis of entries
- **Pattern Recognition**: Cross-entry insights

### AI Mentor
- **Context-Aware Chat**: Personalized conversations
- **Academic Support**: Study and productivity advice

## 🐛 Troubleshooting

### If AI features don't work:
1. Check that your Gemini API key is correct
2. Ensure Firebase is properly configured
3. Check browser console for errors

### If data doesn't save:
1. Verify Firebase Firestore is enabled
2. Check that your Firebase config is correct
3. Ensure you're logged in (create an account first)

## 🎉 You're Ready!

Once you've completed the setup, you'll have a fully functional AI-powered academic wellness app with:

- 🤖 Personalized AI insights
- 📊 Real-time data persistence
- 💬 Context-aware AI mentor
- 📝 Intelligent journal feedback
- ✅ Smart task management

Start by creating an account and exploring the dashboard! 