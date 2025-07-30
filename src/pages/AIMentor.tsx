import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage, ChatSession } from '../types';
import { aiService } from '../services/ai';

const AIMentor: React.FC = () => {
  const { 
    chatMessages, 
    addChatMessage, 
    deleteChatMessage,
    clearChatMessages,
    chatSessions,
    addChatSession,
    updateChatSession,
    deleteChatSession,
    user, 
    moodEntries, 
    tasks, 
    journalEntries 
  } = useApp();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a default session if none exists
  useEffect(() => {
    if (!hasInitialized && user) {
      // Check if there's already a default session
      const existingDefaultSession = chatSessions.find(s => s.title === 'General Chat');
      
      if (chatSessions.length === 0) {
        const defaultSession: ChatSession = {
          id: `session-${Date.now()}`, // Use unique ID instead of 'default'
          userId: user.id,
          title: 'General Chat',
          createdAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: 0,
          isActive: true
        };
        addChatSession(defaultSession);
        setCurrentSession(defaultSession);
      } else if (existingDefaultSession) {
        // Use existing default session
        setCurrentSession(existingDefaultSession);
      } else {
        // No default session found, use the first available session
        const activeSession = chatSessions.find(s => s.isActive) || chatSessions[0];
        setCurrentSession(activeSession);
      }
      setHasInitialized(true);
    }
  }, [user, chatSessions, hasInitialized, addChatSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentSession) return;

    const userMessage: Omit<ChatMessage, 'id'> = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      userId: user?.id
    };

    await addChatMessage(userMessage);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare context data for AI
      const recentMoods = moodEntries.slice(0, 5);
      const pendingTasks = tasks.filter(task => task.status !== 'done').slice(0, 3);
      const recentJournals = journalEntries.slice(0, 3);

      const contextData = {
        latestMood: recentMoods[0]?.mood || 'No recent mood data',
        tasks: pendingTasks,
        lastJournalEntry: recentJournals[0]?.content || 'No recent journal entries',
        streak: 7 // This could be calculated from actual data
      };

      const aiResponse = await aiService.generateMentorResponse(
        inputMessage.trim(),
        contextData
      );

      const aiMessage: Omit<ChatMessage, 'id'> = {
        type: 'ai',
        content: aiResponse.response,
        timestamp: new Date(),
        userId: user?.id
      };

      await addChatMessage(aiMessage);

      // Update session
      if (!isUpdatingSession && currentSession) {
        setIsUpdatingSession(true);
        const updatedSession = {
          ...currentSession,
          lastMessageAt: new Date(),
          messageCount: currentSession.messageCount + 2
        };
        setCurrentSession(updatedSession);
        updateChatSession(currentSession.id, {
          lastMessageAt: new Date(),
          messageCount: currentSession.messageCount + 2
        }).finally(() => {
          setIsUpdatingSession(false);
        });
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Omit<ChatMessage, 'id'> = {
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        userId: user?.id
      };
      await addChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    if (!user) return;
    
    // Clear current messages
    clearChatMessages();
    
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      userId: user.id,
      title: `Chat ${chatSessions.length + 1}`,
      createdAt: new Date(),
      lastMessageAt: new Date(),
      messageCount: 0,
      isActive: true
    };

    addChatSession(newSession);
    setCurrentSession(newSession);
    setShowSessionModal(false);
  };

  const handleSwitchSession = (session: ChatSession) => {
    if (isUpdatingSession) return; // Prevent switching while updating
    
    setCurrentSession(session);
    setIsUpdatingSession(true);
    
    // Update the selected session to be active
    updateChatSession(session.id, { isActive: true }).then(() => {
      // Update other sessions to be inactive
      const updatePromises = chatSessions
        .filter(s => s.id !== session.id)
        .map(s => updateChatSession(s.id, { isActive: false }));
      
      return Promise.all(updatePromises);
    }).finally(() => {
      setIsUpdatingSession(false);
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteChatSession(sessionId);
    if (currentSession?.id === sessionId) {
      const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSession(remainingSessions[0]);
      } else {
        setCurrentSession(null);
      }
    }
    setShowDeleteConfirm(null);
  };

  const getContextualGreeting = () => {
    if (!moodEntries.length) return "Hello! I'm InsideMentor, your AI companion for academic wellness. How can I help you today?";
    
    const latestMood = moodEntries[0];
    const energy = latestMood.energy;
    
    if (energy > 0.7) {
      return "Great energy! I can see you're feeling motivated today. What would you like to work on?";
    } else if (energy < 0.4) {
      return "I notice you might be feeling a bit low on energy. Remember, it's okay to take breaks and be kind to yourself. What's on your mind?";
    } else {
      return "Hello! I'm here to support your academic journey. How are you feeling today?";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat Sessions</h2>
            <button
              onClick={() => setShowSessionModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatSessions
            .filter((session, index, self) => 
              // Remove duplicates based on ID
              index === self.findIndex(s => s.id === session.id)
            )
            .map((session) => (
            <div
              key={session.id}
              onClick={() => handleSwitchSession(session)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                session.isActive
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {session.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {session.messageCount} messages • {formatTime(session.lastMessageAt)}
                  </p>
                </div>
                {session.isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">InsideMentor</h1>
                <p className="text-sm text-gray-600">Empathetic • Intelligent • Focused</p>
              </div>
            </div>
            {currentSession && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{currentSession.title}</span>
                {chatMessages.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all messages in this chat?')) {
                        clearChatMessages();
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(currentSession.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to InsideMentor</h3>
              <p className="text-gray-600 mb-6">{getContextualGreeting()}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Try asking:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setInputMessage("I'm feeling overwhelmed with my studies")}
                    className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    "I'm feeling overwhelmed with my studies"
                  </button>
                  <button
                    onClick={() => setInputMessage("How can I improve my focus?")}
                    className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    "How can I improve my focus?"
                  </button>
                  <button
                    onClick={() => setInputMessage("Help me plan my study schedule")}
                    className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    "Help me plan my study schedule"
                  </button>
                </div>
              </div>
            </div>
          ) : (
            chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                    <button
                      onClick={() => deleteChatMessage(message.id)}
                      className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.type === 'user' ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-red-500'
                      }`}
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-sm text-gray-600">InsideMentor is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* New Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Chat</h3>
            <p className="text-gray-600 mb-6">
              Create a new chat session to organize different conversations with InsideMentor.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSessionModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleNewChat}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Chat Session</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this chat session? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSession(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMentor;