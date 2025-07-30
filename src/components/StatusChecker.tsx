import React from 'react';
import { useApp } from '../context/AppContext';

const StatusChecker: React.FC = () => {
  const { user, tasks, moodEntries, journalEntries, loading } = useApp();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
          <div className="text-white text-xs">🎓</div>
        </div>
        <h3 className="font-semibold text-sm">System Status</h3>
      </div>
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>User:</span>
          <span className={user ? 'text-green-600' : 'text-red-600'}>
            {user ? '✅ Logged In' : '❌ Not Logged In'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Loading:</span>
          <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
            {loading ? '⏳ Loading...' : '✅ Ready'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tasks:</span>
          <span className="text-blue-600">{tasks.length} items</span>
        </div>
        <div className="flex justify-between">
          <span>Mood Entries:</span>
          <span className="text-blue-600">{moodEntries.length} entries</span>
        </div>
        <div className="flex justify-between">
          <span>Journal Entries:</span>
          <span className="text-blue-600">{journalEntries.length} entries</span>
        </div>
        <div className="flex justify-between">
          <span>AI API:</span>
          <span className={import.meta.env.VITE_GEMINI_API_KEY ? 'text-green-600' : 'text-red-600'}>
            {import.meta.env.VITE_GEMINI_API_KEY ? '✅ Configured' : '❌ Not Configured'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Firebase:</span>
          <span className="text-yellow-600">🔄 Mock Data (No Config)</span>
        </div>
        <div className="flex justify-between">
          <span>AI Status:</span>
          <span className="text-blue-600">🔄 Retry Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default StatusChecker; 