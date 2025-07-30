import React, { useState } from 'react';
import { Heart, Calendar, Brain, Sparkles, Activity, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiService } from '../services/ai';

const Mood: React.FC = () => {
  const { moodEntries, addMoodEntry } = useApp();
  const [selectedMood, setSelectedMood] = useState('');
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
  const [oneLiner, setOneLiner] = useState('');
  const [showAIInsight, setShowAIInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [followUpAction, setFollowUpAction] = useState<string>('');

  const moods = [
    { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-300' },
    { emoji: '😌', label: 'Calm', color: 'bg-blue-100 border-blue-300' },
    { emoji: '🤗', label: 'Excited', color: 'bg-orange-100 border-orange-300' },
    { emoji: '😴', label: 'Tired', color: 'bg-purple-100 border-purple-300' },
    { emoji: '😰', label: 'Anxious', color: 'bg-red-100 border-red-300' },
    { emoji: '😤', label: 'Frustrated', color: 'bg-gray-100 border-gray-300' },
    { emoji: '🤔', label: 'Thoughtful', color: 'bg-green-100 border-green-300' },
    { emoji: '😢', label: 'Sad', color: 'bg-indigo-100 border-indigo-300' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    await addMoodEntry({
      mood: selectedMood,
      energy,
      stress: Math.floor(Math.random() * 10) + 1, // Keeping stress for backward compatibility
      focus,
      date: new Date(),
      oneLiner: oneLiner.trim() || undefined
    });

    // Generate instant AI insight
    try {
      const insight = await aiService.generateMoodInsight(
        moodEntries.slice(0, 7),
        selectedMood,
        'user-id' // This should be the actual user ID
      );
      setAiInsight(insight.observation);
      setFollowUpAction(insight.followUpAction || '');
      setShowAIInsight(true);
    } catch (error) {
      console.error('Error generating mood insight:', error);
      setAiInsight('Thanks for sharing your mood. Every check-in helps track your wellbeing journey.');
      setShowAIInsight(true);
    }

    // Reset form
    setSelectedMood('');
    setEnergy(5);
    setFocus(5);
    setOneLiner('');
  };

  const getAverageScore = (field: 'energy' | 'stress' | 'focus') => {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry[field], 0);
    return Math.round(sum / moodEntries.length);
  };



  const getEnergyLevelColor = (level: number) => {
    if (level >= 7) return 'text-green-600';
    if (level >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFocusLevelColor = (level: number) => {
    if (level >= 7) return 'text-blue-600';
    if (level >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Heart className="w-6 h-6 mr-2 text-red-500" />
          Mood Tracking
        </h1>
        <p className="text-gray-600 mt-1">Track your emotional well-being and identify patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Mood Entry Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">How are you feeling today?</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select your mood
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood.label}
                      type="button"
                      onClick={() => setSelectedMood(mood.label)}
                      className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                        selectedMood === mood.label
                          ? `${mood.color} ring-2 ring-blue-500 transform scale-105`
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-xs text-gray-600">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Multi-dimensional Input */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Energy Level: {energy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span className={getEnergyLevelColor(1)}>Low</span>
                    <span className={getEnergyLevelColor(5)}>Medium</span>
                    <span className={getEnergyLevelColor(10)}>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Focus Level: {focus}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={focus}
                    onChange={(e) => setFocus(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span className={getFocusLevelColor(1)}>Distracted</span>
                    <span className={getFocusLevelColor(5)}>Moderate</span>
                    <span className={getFocusLevelColor(10)}>Focused</span>
                  </div>
                </div>
              </div>

              {/* One-liner Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's the main reason for this feeling? (optional)
                </label>
                <input
                  type="text"
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                  placeholder="e.g., Finished my big project, feeling overwhelmed with assignments..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedMood}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Record Mood
              </button>
            </form>
          </div>
        </div>

        {/* Enhanced Mood Statistics */}
        <div className="space-y-6">
          {/* Current Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Averages</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Energy
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(getAverageScore('energy') / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{getAverageScore('energy')}/10</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Focus
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(getAverageScore('focus') / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{getAverageScore('focus')}/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Entries
            </h3>
            <div className="space-y-3">
              {moodEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {moods.find(m => m.label === entry.mood)?.emoji || '😊'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{entry.mood}</div>
                      <div className="text-xs text-gray-500">
                        {entry.date.toLocaleDateString()}
                      </div>
                      {entry.oneLiner && (
                        <div className="text-xs text-gray-600 italic">
                          "{entry.oneLiner}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Energy: {entry.energy}/10</div>
                    <div className="text-xs text-gray-500">Focus: {entry.focus}/10</div>
                  </div>
                </div>
              ))}
              {moodEntries.length === 0 && (
                <p className="text-gray-500 text-center py-4">No mood entries yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Insight Modal */}
      {showAIInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-purple-600 mr-2" />
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insight</h3>
              <p className="text-gray-600 mb-4">
                {aiInsight}
              </p>
              {followUpAction && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Suggested Action:</strong> {followUpAction}
                  </p>
                </div>
              )}
              <button
                onClick={() => setShowAIInsight(false)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mood;