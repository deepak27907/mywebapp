import React, { useState, useEffect } from 'react';
import { Heart, Target, BookOpen, Sparkles, Calendar, Award, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiService, AIProgressReportResponse } from '../services/ai';

const Progress: React.FC = () => {
  const { user, tasks, moodEntries, journalEntries } = useApp();
  const [progressReport, setProgressReport] = useState<AIProgressReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateProgressReport = async () => {
      if (user && moodEntries.length > 0) {
        try {
          const report = await aiService.generateProgressReport(
            moodEntries,
            tasks,
            journalEntries
          );
          setProgressReport(report);
        } catch (error) {
          console.error('Error generating progress report:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    generateProgressReport();
  }, [user, moodEntries, tasks, journalEntries]);

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return 'stable';
    const recent = moodEntries.slice(0, 3);
    const older = moodEntries.slice(3, 6);
    
    const recentAvg = recent.reduce((acc, entry) => acc + entry.energy, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((acc, entry) => acc + entry.energy, 0) / older.length : recentAvg;
    
    return recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';
  };

  const getTaskCompletionRate = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'done').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getStreak = () => {
    // Calculate consecutive days with mood entries
    let streak = 0;
    const today = new Date();
    const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getAverageEnergy = () => {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry.energy, 0);
    return Math.round(sum / moodEntries.length);
  };

  const getAverageFocus = () => {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry.focus, 0);
    return Math.round(sum / moodEntries.length);
  };

  const getMostCommonMood = () => {
    if (moodEntries.length === 0) return 'No data';
    const moodCounts = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0][0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Generating your progress report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
          Overall Progress
        </h1>
        <p className="text-gray-600 mt-1">Track your academic wellness journey and growth patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-purple-600">{getStreak()} days</p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Task Completion</p>
              <p className="text-2xl font-bold text-green-600">{getTaskCompletionRate()}%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Energy</p>
              <p className="text-2xl font-bold text-orange-600">{getAverageEnergy()}/10</p>
            </div>
            <Heart className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Focus</p>
              <p className="text-2xl font-bold text-blue-600">{getAverageFocus()}/10</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* AI Progress Report */}
      {progressReport && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Mood & Wellbeing</h3>
              <p className="text-gray-600 text-sm mb-4">{progressReport.moodTrend}</p>
              
              <h3 className="text-md font-medium text-gray-900 mb-2">Productivity Insights</h3>
              <p className="text-gray-600 text-sm">{progressReport.productivityInsight}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Journal Themes</h3>
              <p className="text-gray-600 text-sm mb-4">{progressReport.journalThemes}</p>
              
              <h3 className="text-md font-medium text-gray-900 mb-2">Recommendations</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                {progressReport.recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mood Analysis Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-500" />
          Mood & Energy Trends
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Mood Trend</span>
            <span className={`text-sm font-medium ${
              getMoodTrend() === 'improving' ? 'text-green-600' : 
              getMoodTrend() === 'declining' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {getMoodTrend().charAt(0).toUpperCase() + getMoodTrend().slice(1)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Most Common Mood</span>
            <span className="text-sm font-medium text-gray-900">{getMostCommonMood()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Average Energy Level</span>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(getAverageEnergy() / 10) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{getAverageEnergy()}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
          Recent Activity
        </h2>
        
        <div className="space-y-3">
          {moodEntries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-3">😊</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{entry.mood}</div>
                  <div className="text-xs text-gray-500">
                    {entry.date.toLocaleDateString()} • Energy: {entry.energy}/10 • Focus: {entry.focus}/10
                  </div>
                  {entry.oneLiner && (
                    <div className="text-xs text-gray-600 italic mt-1">
                      "{entry.oneLiner}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-500" />
          Task Progress
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Tasks</span>
            <span className="text-sm font-medium">{tasks.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="text-sm font-medium text-green-600">
              {tasks.filter(t => t.status === 'done').length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">In Progress</span>
            <span className="text-sm font-medium text-yellow-600">
              {tasks.filter(t => t.status === 'in-progress').length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pending</span>
            <span className="text-sm font-medium text-red-600">
              {tasks.filter(t => t.status === 'todo').length}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${getTaskCompletionRate()}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;