import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiService } from '../services/ai';

const AIMentor: React.FC = () => {
  const { chatMessages, addChatMessage, user, tasks, moodEntries, journalEntries } = useApp();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    
    // Add user message
    await addChatMessage({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    setMessage('');
    setIsTyping(true);

    try {
      // Prepare context data
      const latestMood = moodEntries[0]?.mood || 'No recent mood data';
      const recentTasks = tasks.slice(0, 5);
      const lastJournalEntry = journalEntries[0]?.content || 'No recent journal entries';
      const streak = 7; // This could be calculated from actual data

      const contextData = {
        latestMood,
        tasks: recentTasks,
        lastJournalEntry,
        streak
      };

      // Generate AI response
      const result = await aiService.generateMentorResponse(userMessage, contextData, user?.id || '');
      
      await addChatMessage({
        type: 'ai',
        content: result.response,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response
      await addChatMessage({
        type: 'ai',
        content: "I understand how you're feeling. Let's work through this together. What would be most helpful for you right now?",
        timestamp: new Date()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const formatMarkdown = (text: string) => {
    // Simple markdown parsing for bold text
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const suggestedQuestions = [
    "How can I improve my study habits?",
    "I'm feeling overwhelmed with assignments",
    "What's the best way to manage stress?",
    "How do I stay motivated?"
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-sm p-6 border border-gray-100 border-b-0">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Mentor</h1>
            <p className="text-sm text-gray-600">Your personal academic companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white border border-gray-100 border-t-0 border-b-0 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Welcome Message */}
          {chatMessages.length === 0 && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <Bot className="w-16 h-16 text-purple-600" />
                <Sparkles className="w-8 h-8 text-purple-400 ml-2" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Hello {user?.name}! 👋
              </h2>
              <p className="text-gray-600 mb-6">
                I'm your AI mentor, here to help you with academic challenges, study strategies, and personal growth.
                I can see your recent activity and provide personalized advice.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="text-left p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-xs lg:max-w-md ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 ${msg.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(msg.content)
                    }}
                  />
                  <div className={`text-xs mt-1 ${
                    msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp && typeof msg.timestamp.toLocaleTimeString === 'function' 
                      ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex mr-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-b-xl shadow-sm p-6 border border-gray-100 border-t-0">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything about studying, productivity, or personal growth..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIMentor;