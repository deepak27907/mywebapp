# Firebase & AI Service Setup Fix

## 🔧 Quick Fix Steps

### 1. Create Environment File
Run this command to create your `.env` file:
```bash
node create-env.js
```

### 2. Configure Firebase

#### Step 1: Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Click "Add app" → "Web app"
4. Register your app with a nickname
5. Copy the config object

#### Step 2: Update .env File
Replace the placeholder values in your `.env` file:

```env
# Google Gemini API
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 3. Set Up Firebase Security Rules

In your Firebase Console:
1. Go to Firestore Database
2. Click "Rules" tab
3. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /moodEntries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /progressReports/{reportId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /weeklyReports/{reportId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. Enable Authentication

In Firebase Console:
1. Go to Authentication
2. Click "Get started"
3. Enable "Email/Password" provider
4. Add your test users or enable sign-up

### 5. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

## 🚨 Error Solutions

### AI Service 503 Errors
- **Cause**: API quota exceeded or service unavailable
- **Solution**: 
  - Check your Gemini API key is correct
  - Wait for rate limits to reset
  - The app now has better retry logic

### Firebase Permission Errors
- **Cause**: Security rules not configured or user not authenticated
- **Solution**:
  - Update security rules (see step 3 above)
  - Ensure user is signed in before accessing data
  - The app now has fallback storage

### Firestore Connection Issues
- **Cause**: Network issues or incorrect configuration
- **Solution**:
  - Check your Firebase config values
  - Ensure Firestore is enabled in Firebase Console
  - The app now gracefully falls back to local storage

## 🔄 Testing Your Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Try signing up with a new account
   - Check browser console for errors

3. **Test AI Features**:
   - Try creating a task with AI parsing
   - Check if AI responses work

4. **Test Firebase Storage**:
   - Create a task and check if it persists
   - Check browser console for Firebase errors

## 🛠️ Troubleshooting

### If you still get 503 errors:
- Wait 5-10 minutes for rate limits to reset
- Check your Gemini API key is valid
- The app will now retry automatically

### If you still get Firebase permission errors:
- Make sure you're signed in
- Check the security rules are saved
- The app will now use local storage as fallback

### If the app doesn't work at all:
- Check your `.env` file has all required values
- Restart the development server
- Clear browser cache and try again

## 📝 Notes

- The app now has **graceful fallbacks** for both AI and Firebase services
- **Better error handling** with specific retry logic
- **Local storage fallback** when Firebase is unavailable
- **Improved user experience** with helpful error messages

## 🎯 Success Indicators

✅ No more 503 errors in console  
✅ No more Firebase permission errors  
✅ Tasks and data persist properly  
✅ AI features work (with retries if needed)  
✅ User authentication works smoothly 