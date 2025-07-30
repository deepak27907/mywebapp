# 🚀 **Netlify Deployment Guide**

## **Prerequisites**
- GitHub repository with your project
- Firebase project set up
- Google Cloud project with Gemini API enabled

---

## **Step 1: Set up Firebase**

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "insidementor-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Add Web App to Firebase
1. In Firebase Console, click the web icon (</>)
2. Register app with nickname (e.g., "insidementor-web")
3. Copy the Firebase config object

### 1.3 Enable Authentication
1. Go to Authentication → Sign-in method
2. Enable "Email/Password"
3. Click "Save"

### 1.4 Set up Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users

### 1.5 Set Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
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
    
    match /chatSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## **Step 2: Set up Google Gemini API**

### 2.1 Enable Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

### 2.2 (Alternative) Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to APIs & Services → Library
4. Search for "Generative Language API"
5. Click "Enable"
6. Go to APIs & Services → Credentials
7. Click "Create Credentials" → "API Key"
8. Copy the API key

---

## **Step 3: Deploy to Netlify**

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3.2 Connect to Netlify
1. Go to [Netlify](https://netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

### 3.3 Set Environment Variables in Netlify
1. In your Netlify dashboard, go to Site settings → Environment variables
2. Add the following variables:

#### **Firebase Variables:**
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### **Gemini API Variable:**
```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3.4 Redeploy
1. Go to Netlify dashboard
2. Click "Trigger deploy" → "Deploy site"
3. Wait for the build to complete

---

## **Step 4: Verify Deployment**

### 4.1 Check Environment Variables
1. Open browser console on your deployed site
2. Look for these messages:
   - ✅ "Firebase initialized successfully" (if Firebase is configured)
   - ⚠️ "Missing Firebase environment variables" (if not configured)
   - ✅ "App will run in offline mode" (fallback mode)

### 4.2 Test Features
1. **Authentication**: Try creating an account and signing in
2. **Tasks**: Create, edit, and delete tasks
3. **Mood Tracking**: Add mood entries
4. **Journal**: Write journal entries
5. **AI Mentor**: Test the AI chat functionality

---

## **Troubleshooting**

### **Firebase Issues:**
- Check if all Firebase environment variables are set correctly
- Verify Firestore security rules are properly configured
- Ensure Authentication is enabled in Firebase Console

### **Gemini API Issues:**
- Verify the API key is correct
- Check if Gemini API is enabled in Google Cloud Console
- Ensure the API key has proper permissions

### **Netlify Issues:**
- Check build logs for errors
- Verify environment variables are set correctly
- Ensure the build command and publish directory are correct

### **Common Errors:**
1. **"Firebase not configured"**: Environment variables not set
2. **"Permission denied"**: Firestore security rules too restrictive
3. **"API key invalid"**: Gemini API key incorrect or not enabled

---

## **Security Notes**

### **Environment Variables:**
- Never commit API keys to GitHub
- Use Netlify's environment variable feature
- Consider using different keys for development and production

### **Firebase Security:**
- Review and update Firestore security rules
- Enable Authentication methods you need
- Monitor Firebase usage and costs

### **API Usage:**
- Monitor Gemini API usage
- Set up billing alerts
- Consider rate limiting for production

---

## **Next Steps**

1. **Custom Domain**: Set up a custom domain in Netlify
2. **SSL Certificate**: Netlify provides free SSL certificates
3. **Analytics**: Add Google Analytics or other tracking
4. **Monitoring**: Set up error monitoring (Sentry, etc.)
5. **Backup**: Set up regular database backups

---

## **Support**

If you encounter issues:
1. Check the browser console for error messages
2. Review Netlify build logs
3. Verify all environment variables are set correctly
4. Test locally with the same environment variables

**Happy Deploying! 🎉** 