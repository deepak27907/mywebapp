# ⚡ **Quick Deploy to Netlify**

## **5-Minute Setup**

### **Step 1: Set up Environment Variables**
```bash
npm run setup
```
This creates your `.env` file. Edit it with your API keys.

### **Step 2: Get Your API Keys**

#### **Firebase (2 minutes):**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project → Add web app
3. Copy config values to `.env`

#### **Gemini API (1 minute):**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env` as `VITE_GEMINI_API_KEY`

### **Step 3: Deploy to Netlify**
1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Connect to Netlify:
   - Go to [Netlify](https://netlify.com/)
   - Import from GitHub
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. Add Environment Variables in Netlify:
   - Go to Site settings → Environment variables
   - Add all variables from your `.env` file

4. Deploy! 🚀

---

## **What You Get**

✅ **Full-featured academic wellness app**
✅ **Firebase authentication & database**
✅ **AI mentor powered by Gemini**
✅ **Task management with drag & drop**
✅ **Mood tracking & analytics**
✅ **Personal journaling**
✅ **Progress tracking with charts**
✅ **Responsive design**

---

## **Need Help?**

- 📖 Full guide: `DEPLOYMENT_GUIDE.md`
- 🔧 Troubleshooting: Check browser console
- 🆘 Issues: Check Netlify build logs

**Your app will work in offline mode even without API keys!** 