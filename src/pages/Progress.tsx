import React from 'react';
import { TrendingUp, Award, Calendar, Target, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Progress: React.FC = () => {
  const { tasks, moodEntries, journalEntries } = useApp();

  // Calculate statistics
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currentStreak = 7; // Placeholder
  const longestStreak = 14; // Placeholder
  const weeklyGoal = 85; // Percentage

  const badges = [
    { id: 1, name: 'First Steps', description: 'Complete your first task', earned: true, icon: '🎯' },
    { id: 2, name: 'Mood Tracker', description: 'Log mood for 7 days', earned: true, icon: '😊' },
    { id: 3, name: 'Journaling Habit', description: 'Write 5 journal entries', earned: journalEntries.length >= 5, icon: '📝' },
    { id: 4, name: 'Task Master', description: 'Complete 25 tasks', earned: completedTasks >= 25, icon: '✅' },
    { id: 5, name: 'Consistency King', description: 'Maintain 14-day streak', earned: false, icon: '👑' },
    { id: 6, name: 'Self Reflection', description: 'Get AI feedback on 10 entries', earned: false, icon: '🧠' }
  ];

  const earnedBadges = badges.filter(badge => badge.earned);
  const upcomingBadges = badges.filter(badge => !badge.earned);

  // Mock chart data
  const weeklyMoodData = [
    { day: 'Mon', mood: 8, energy: 7 },
    { day: 'Tue', mood: 6, energy: 6 },
    { day: 'Wed', mood: 9, energy: 8 },
    { day: 'Thu', mood: 7, energy: 7 },
    { day: 'Fri', mood: 8, energy: 9 },
    { day: 'Sat', mood: 9, energy: 8 },
    { day: 'Sun', mood: 7, energy: 6 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
          Progress Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Track your achievements and growth over time</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-orange-600">{currentStreak} days</p>
            </div>
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Badges Earned</p>
              <p className="text-2xl font-bold text-purple-600">{earnedBadges.length}</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Weekly Mood & Energy
          </h2>
          <div className="space-y-4">
            {weeklyMoodData.map((day, index) => (
              <div key={day.day} className="flex items-center space-x-4">
                <div className="w-12 text-sm text-gray-600">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500 w-12">Mood</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(day.mood / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-8">{day.mood}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 w-12">Energy</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(day.energy / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-8">{day.energy}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Achievements
          </h2>
          
          {/* Earned Badges */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Earned Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <span className="text-2xl mr-3">{badge.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-green-900">{badge.name}</div>
                    <div className="text-xs text-green-700">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Badges */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Next Goals</h3>
            <div className="space-y-3">
              {upcomingBadges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-2xl mr-3 opacity-50">{badge.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                    <div className="text-xs text-gray-600">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Streaks & Goals */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Streak History</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">{currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
            <div className="text-xs text-gray-500 mt-1">Keep it up!</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{longestStreak}</div>
            <div className="text-sm text-gray-600">Longest Streak</div>
            <div className="text-xs text-gray-500 mt-1">Personal best</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{weeklyGoal}%</div>
            <div className="text-sm text-gray-600">Weekly Goal</div>
            <div className="text-xs text-gray-500 mt-1">On track!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;