import React, { useState } from 'react';
import { aiService } from '../services/ai';

const AITest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAI = async () => {
    setIsLoading(true);
    try {
      console.log('Testing AI service...');
      
      // Test dashboard greeting
      const greeting = await aiService.generateDashboardGreeting(
        'Test User',
        [{ id: '1', title: 'Test Task', status: 'done' }],
        [{ id: '1', mood: 'happy', date: new Date() }],
        'test-user-id'
      );
      
      console.log('AI Greeting Result:', greeting);
      setTestResult(JSON.stringify(greeting, null, 2));
      
    } catch (error) {
      console.error('AI Test Error:', error);
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-semibold text-sm mb-2">🤖 AI Test</h3>
      <button
        onClick={testAI}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test AI'}
      </button>
      {testResult && (
        <div className="mt-2">
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AITest; 