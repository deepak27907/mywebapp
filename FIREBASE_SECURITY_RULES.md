# Firebase Security Rules Setup

## 🔧 Quick Fix for Permission Errors

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** in the left sidebar

### Step 2: Update Security Rules
1. Click on the **"Rules"** tab
2. Replace the existing rules with this **SIMPLE VERSION** for testing:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read/write (for testing)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**OR** use this **MORE SECURE VERSION** for production:

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

### Step 3: Publish Rules
1. Click **"Publish"** to save the rules
2. Wait for the rules to deploy (usually takes a few seconds)

## 🔍 **Troubleshooting Steps**

If you're still getting permission errors after updating the rules:

1. **Try the SIMPLE VERSION first** (allows all authenticated users)
2. **Check if you're signed in** - the app should show you're authenticated
3. **Clear browser cache** and try again
4. **Wait 1-2 minutes** for rules to fully deploy

## 🤖 **Fix AI Service 503 Errors**

The 503 errors mean the Gemini API is temporarily overloaded. The app already has retry logic, but you can:

### Option 1: Wait and Retry
- The app will automatically retry in a few seconds
- Wait 5-10 minutes for the API to stabilize

### Option 2: Check Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Verify your API key is correct
3. Check if you have any usage limits

## ✅ **Expected Results**

After updating the Firebase security rules:
- ✅ No more "Missing or insufficient permissions" errors
- ✅ Chat messages will save to Firebase
- ✅ All data will persist properly

The AI service will automatically retry when the 503 errors resolve.

## 🔍 **Test Your Fix**

1. **Update the Firebase security rules** (use the SIMPLE VERSION first)
2. **Try sending a chat message** in your app
3. **Check the browser console** - you should see no more permission errors

The app is already handling these errors gracefully with fallback storage, but updating the security rules will make Firebase work properly! 