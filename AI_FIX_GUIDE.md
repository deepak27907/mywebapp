# 🤖 AI Fix Guide - InsideMentor

## 🚨 **AI Not Working - Quick Fix**

### **Step 1: Check API Key**
Create a `.env` file in your project root with:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### **Step 2: Get Gemini API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Replace `your_actual_gemini_api_key_here` with your real key

### **Step 3: Restart the App**
```bash
npm run dev
```

## 🔍 **Debug Steps**

### **1. Check Console Logs**
- Open browser developer tools (F12)
- Look for AI-related messages
- Check if API key is detected

### **2. Test AI Functionality**
- Look for "🤖 AI Test" button in top-right corner
- Click to test AI responses
- Check console for errors

### **3. Current Status**
- ✅ **Fallback Mode** - Works without API key
- ✅ **Error Handling** - Graceful degradation
- ✅ **Test Component** - Debug AI functionality

## 🎯 **What Should Work**

### **Without API Key (Fallback Mode):**
- ✅ Dashboard greeting (fallback)
- ✅ Mood insights (fallback)
- ✅ Task sorting (fallback)
- ✅ Task breakdown (fallback)
- ✅ Journal feedback (fallback)
- ✅ AI mentor chat (fallback)

### **With API Key (Real AI):**
- ✅ Real Gemini AI responses
- ✅ Personalized greetings
- ✅ Smart mood analysis
- ✅ Intelligent task sorting
- ✅ Context-aware feedback
- ✅ Advanced AI mentor

## 🛠️ **Troubleshooting**

### **Issue: "API key not configured"**
**Solution:** Add your Gemini API key to `.env` file

### **Issue: "Model not available"**
**Solution:** Using `gemini-1.5-flash` model (stable)

### **Issue: "Network error"**
**Solution:** Check internet connection and API key validity

### **Issue: "JSON parse error"**
**Solution:** AI responses are being handled with fallbacks

## 🚀 **Quick Test**

1. **Check browser console** for AI messages
2. **Click "🤖 AI Test"** button
3. **Try logging in** and using AI features
4. **Check status checker** for AI status

## 📊 **Expected Results**

### **Fallback Mode (No API Key):**
```
AI Greeting: "Good morning, [Name]! Ready to make today productive?"
Progress Insight: "Keep up the great work on your tasks!"
```

### **Real AI Mode (With API Key):**
```
AI Greeting: Personalized message based on user activity
Progress Insight: Specific insights about recent progress
```

The AI should work in fallback mode even without an API key! 🤖✨ 