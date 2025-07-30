import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Heart, Plus, ChevronRight, Sparkles, Flame, Target, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiService } from '../services/ai';

const Dashboard: React.FC = () => {
  const { user, tasks, moodEntries, addMoodEntry, loading } = useApp();
  const [selectedMood, setSelectedMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [focusLevel, setFocusLevel] = useState(5);
  const [oneLiner, setOneLiner] = useState('');
  const [hasMoodCheckedIn, setHasMoodCheckedIn] = useState(false);
  const [aiGreeting, setAiGreeting] = useState<{ greeting: string; progressInsight: string; quickTip: string } | null>(null);
  const [moodInsight, setMoodInsight] = useState<string | null>(null);
  const [showQuickTip, setShowQuickTip] = useState(true);

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😰', label: 'Stressed' },
    { emoji: '😤', label: 'Frustrated' },
    { emoji: '🤔', label: 'Thoughtful' }
  ];

  const todayTasks = tasks.filter(task => task.status !== 'done').slice(0, 3);
  const completedToday = tasks.filter(task => task.status === 'done').length;
  const recentCompletedTasks = tasks.filter(task => task.status === 'done').slice(0, 3);
  const recentMoodLogs = moodEntries.slice(0, 7);

  // Check if user has checked in today
  const hasCheckedInToday = () => {
    const today = new Date().toDateString();
    return moodEntries.some(entry => new Date(entry.date).toDateString() === today);
  };

  // Get contextual action based on current state
  const getContextualAction = () => {
    if (!hasCheckedInToday()) {
      return {
        title: 'Mood Check-in',
        description: 'How are you feeling today?',
        action: 'mood',
        icon: Heart,
        color: 'bg-red-500'
      };
    }
    
    const urgentTasks = tasks.filter(task => 
      task.priority === 'high' && task.status !== 'done'
    );
    
    if (urgentTasks.length > 0) {
      return {
        title: 'Urgent Tasks',
        description: `${urgentTasks.length} high-priority tasks need attention`,
        action: 'tasks',
        icon: Target,
        color: 'bg-orange-500'
      };
    }

    const lastMood = moodEntries[0];
    if (lastMood && ['Stressed', 'Frustrated', 'Tired'].includes(lastMood.mood)) {
      return {
        title: 'Talk to AI Mentor',
        description: 'Feeling down? Let\'s chat about it',
        action: 'mentor',
        icon: MessageCircle,
        color: 'bg-purple-500'
      };
    }

    return {
      title: 'Add Task',
      description: 'What would you like to accomplish today?',
      action: 'tasks',
      icon: Plus,
      color: 'bg-blue-500'
    };
  };

  // Generate AI greeting on component mount
  useEffect(() => {
    const generateGreeting = async () => {
      if (user && !loading) {
        try {
          const greeting = await aiService.generateDashboardGreeting(
            user.name,
            recentCompletedTasks,
            recentMoodLogs
          );
          setAiGreeting(greeting);
        } catch (error) {
          console.error('Error generating greeting:', error);
        }
      }
    };

    generateGreeting();
  }, [user, loading, tasks, moodEntries, recentCompletedTasks, recentMoodLogs]);

  const handleMoodCheckIn = async () => {
    if (selectedMood) {
      await addMoodEntry({
        mood: selectedMood,
        energy: energyLevel,
        stress: Math.floor(Math.random() * 10) + 1,
        focus: focusLevel,
        date: new Date(),
        oneLiner: oneLiner.trim() || undefined
      });
      setHasMoodCheckedIn(true);

      // Generate mood insight
      try {
        const insight = await aiService.generateMoodInsight(
          recentMoodLogs,
          selectedMood
        );
        setMoodInsight(insight.observation);
      } catch (error) {
        console.error('Error generating mood insight:', error);
      }
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const contextualAction = getContextualAction();

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {aiGreeting ? aiGreeting.greeting : `${getTimeGreeting()}, ${user?.name}! 👋`}
            </h1>
            {aiGreeting && (
              <p className="text-gray-600 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                {aiGreeting.progressInsight}
              </p>
            )}
            <div className="text-sm text-gray-600 mb-3">
              <p><strong>Student ID:</strong> {user?.studentId}</p>
              <p><strong>Institute:</strong> {user?.institute} • <strong>Department:</strong> {user?.department}</p>
              <p><strong>Year:</strong> {user?.year}</p>
            </div>
          </div>
          {aiGreeting && (
            <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              AI Powered
            </div>
          )}
        </div>
      </div>

      {/* Contextual Action Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${contextualAction.color} rounded-lg flex items-center justify-center mr-4`}>
              <contextualAction.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{contextualAction.title}</h2>
              <p className="text-gray-600">{contextualAction.description}</p>
            </div>
          </div>
          <Link
            to={`/${contextualAction.action}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {contextualAction.action === 'mood' ? 'Check In' : 'View'}
          </Link>
        </div>
      </div>

      {/* Quick Tip Card */}
      {aiGreeting?.quickTip && showQuickTip && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">Quick Tip</h3>
                <p className="text-sm text-blue-800">{aiGreeting.quickTip}</p>
              </div>
            </div>
            <button
              onClick={() => setShowQuickTip(false)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Mood Check-in */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Quick Mood Check-in
              </h2>
              {hasMoodCheckedIn && (
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  ✓ Complete
                </span>
              )}
            </div>

            {!hasMoodCheckedIn ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">How are you feeling right now?</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => setSelectedMood(mood.label)}
                        className={`p-3 rounded-lg text-2xl transition-all duration-200 ${
                          selectedMood === mood.label
                            ? 'bg-blue-50 ring-2 ring-blue-500 transform scale-110'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Energy Level: {energyLevel}/10</p>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Focus Level: {focusLevel}/10</p>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={focusLevel}
                      onChange={(e) => setFocusLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's the main reason for this feeling? (optional)
                  </label>
                  <input
                    type="text"
                    value={oneLiner}
                    onChange={(e) => setOneLiner(e.target.value)}
                    placeholder="e.g., Finished my big project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleMoodCheckIn}
                  disabled={!selectedMood}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Submit Check-in
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-gray-600">Thanks for checking in! Your mood has been recorded.</p>
                {moodInsight && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {moodInsight}
                    </p>
                  </div>
                )}
                <Link
                  to="/mood"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-2 text-sm"
                >
                  View detailed mood tracking
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Progress Snapshot */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Flame className="w-5 h-5 mr-2 text-orange-500" />
            Progress Snapshot
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasks Completed</span>
              <span className="text-lg font-bold text-green-600">{completedToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Streak</span>
              <span className="text-lg font-bold text-blue-600">7 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weekly Goal</span>
              <span className="text-lg font-bold text-orange-600">85%</span>
            </div>
            <Link
              to="/progress"
              className="block text-center bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm"
            >
              View Full Progress
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Priorities */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
            Today's Priorities (Top 3)
          </h2>
          <Link
            to="/tasks"
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          >
            View all tasks
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-3">
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tasks for today. Great job!</p>
              <Link
                to="/tasks"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add a task
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;