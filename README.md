# InsideMentor - AI-Powered Academic Wellness App

A comprehensive React/TypeScript application that combines task management, mood tracking, journaling, and AI-powered insights to support student wellness and productivity.

## Features

### 🤖 AI-Powered Features

1. **Dashboard Greeting & Progress Snapshot**
   - Personalized greetings based on recent accomplishments
   - AI-generated progress insights
   - Motivational messages tailored to user activity

2. **Mood Insights**
   - AI analysis of mood patterns
   - Empathetic observations about mood changes
   - Personalized mood tracking insights

3. **AI Task Sorting**
   - Intelligent task prioritization based on mood and energy
   - Context-aware task ordering
   - Optimized for low-energy periods

4. **Task Breakdown**
   - AI-powered subtask generation
   - Automatic breakdown of complex tasks
   - Actionable step-by-step guidance

5. **Journal AI Feedback**
   - Thoughtful analysis of journal entries
   - Pattern recognition across entries
   - Empathetic reflections and insights

6. **AI Mentor Chat**
   - Context-aware conversations
   - Personalized advice based on user data
   - Support for academic and personal challenges

### 📊 Core Features

- **Task Management**: Kanban board with drag-and-drop functionality
- **Mood Tracking**: Daily mood check-ins with energy levels
- **Journaling**: Rich text journal entries with AI feedback
- **Progress Tracking**: Visual progress indicators and streaks
- **Firebase Integration**: Real-time data persistence

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set up security rules for Firestore
4. Add your web app to the project
5. Copy the configuration values to your `.env` file

### 4. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key for Gemini
3. Add the API key to your `.env` file

### 5. Run the Application

```bash
npm run dev
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (@google/generative-ai)
- **Database**: Firebase Firestore
- **State Management**: React Context
- **UI Components**: Lucide React Icons
- **Drag & Drop**: React Beautiful DnD

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context for state management
├── pages/              # Main application pages
├── services/           # AI and Firebase services
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## AI Features Implementation

### Dashboard Greeting
- Fetches recent tasks and mood logs
- Generates personalized greetings using Gemini
- Displays progress insights

### Mood Insights
- Analyzes last 7 mood entries
- Provides empathetic observations
- Shows patterns and changes

### Task Sorting
- Sends task list and mood history to AI
- Reorders tasks based on energy levels
- Prioritizes easy wins for low energy

### Task Breakdown
- Breaks down complex tasks into subtasks
- Generates 3-5 actionable steps
- Integrates with task creation flow

### Journal Feedback
- Analyzes current and past entries
- Provides thoughtful reflections
- Connects patterns across entries

### AI Mentor Chat
- Context-aware conversations
- Uses user's mood, tasks, and journal data
- Provides personalized academic support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details # mywebapp
# mywebapp
