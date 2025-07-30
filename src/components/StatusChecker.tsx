import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info, Bug, RefreshCw } from 'lucide-react';

const StatusChecker: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
                               import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key_here';
  const isGeminiConfigured = import.meta.env.VITE_GEMINI_API_KEY && 
                             import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here';

  // Debug information (safe to show)
  const debugInfo = {
    hasFirebaseKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    hasFirebaseDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    hasFirebaseProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
    firebaseKeyLength: import.meta.env.VITE_FIREBASE_API_KEY?.length || 0,
    geminiKeyLength: import.meta.env.VITE_GEMINI_API_KEY?.length || 0
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">App Status</h3>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Refresh to check for new environment variables"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-2">
        {/* Firebase Status */}
        <div className="flex items-center space-x-2">
          {isFirebaseConfigured ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          )}
          <span className={`text-xs ${isFirebaseConfigured ? 'text-green-600' : 'text-yellow-600'}`}>
            {isFirebaseConfigured ? 'Firebase: Online' : 'Firebase: Offline Mode'}
          </span>
        </div>

        {/* Gemini API Status */}
        <div className="flex items-center space-x-2">
          {isGeminiConfigured ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          )}
          <span className={`text-xs ${isGeminiConfigured ? 'text-green-600' : 'text-yellow-600'}`}>
            {isGeminiConfigured ? 'AI Mentor: Available' : 'AI Mentor: Limited'}
          </span>
        </div>

        {/* Debug Information */}
        <div className="mt-3 p-2 bg-gray-50 rounded">
          <div className="flex items-center space-x-2 mb-2">
            <Bug className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Debug Info</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Firebase Key: {debugInfo.hasFirebaseKey ? '✅' : '❌'} ({debugInfo.firebaseKeyLength} chars)</div>
            <div>Firebase Domain: {debugInfo.hasFirebaseDomain ? '✅' : '❌'}</div>
            <div>Firebase Project ID: {debugInfo.hasFirebaseProjectId ? '✅' : '❌'}</div>
            <div>Gemini Key: {debugInfo.hasGeminiKey ? '✅' : '❌'} ({debugInfo.geminiKeyLength} chars)</div>
          </div>
        </div>

        {/* Info Message */}
        {!isFirebaseConfigured && (
          <div className="flex items-start space-x-2 mt-3 p-2 bg-blue-50 rounded">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Offline Mode Active</p>
              <p className="text-blue-600">Data is stored locally. Some features may be limited.</p>
              <p className="text-blue-600 mt-1">Check Netlify environment variables if you want online mode.</p>
              <p className="text-blue-600 mt-1">Click refresh button after setting variables.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusChecker; 