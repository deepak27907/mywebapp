import React, { useState } from 'react';
import { BookOpen, Plus, Brain, Calendar, Search, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiService } from '../services/ai';

const Journal: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, user } = useApp();
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>('');

  const filteredEntries = journalEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await addJournalEntry({
      title: title.trim(),
      content: content.trim(),
      date: new Date()
    });

    setTitle('');
    setContent('');
    setIsWriting(false);
  };

  const handleGetAIFeedback = async (entryId: string) => {
    const entry = journalEntries.find(e => e.id === entryId);
    if (!entry) return;

    setSelectedEntry(entryId);
    setIsGeneratingFeedback(true);
    setShowAIFeedback(true);

    try {
      const pastEntries = journalEntries
        .filter(e => e.id !== entryId)
        .slice(0, 3)
        .map(e => e.content);

      const result = await aiService.generateJournalFeedback(
        entry.content,
        pastEntries,
        user?.id || ''
      );

      setAiFeedback(result.feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      setAiFeedback('Thank you for sharing your thoughts. Your journal entries show growth and self-reflection.');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (selectedEntry && aiFeedback) {
      await updateJournalEntry(selectedEntry, { aiFeedback });
      setShowAIFeedback(false);
      setAiFeedback('');
      setSelectedEntry(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-500" />
            Journal
          </h1>
          <p className="text-gray-600 mt-1">Reflect on your thoughts and experiences</p>
        </div>
        <button
          onClick={() => setIsWriting(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search journal entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* New Entry Modal */}
      {isWriting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Journal Entry</h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your thoughts..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={12}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !content.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal Entries */}
      <div className="grid gap-6">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{entry.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(entry.date)}
                  </div>
                </div>
                <button
                  onClick={() => handleGetAIFeedback(entry.id)}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm"
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Get AI Feedback
                </button>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              </div>
              {entry.aiFeedback && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-900 mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-1" />
                    AI Feedback
                  </h4>
                  <p className="text-purple-800 text-sm">{entry.aiFeedback}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries yet</h3>
            <p className="text-gray-600 mb-4">Start journaling to track your thoughts and reflections</p>
            <button
              onClick={() => setIsWriting(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write your first entry
            </button>
          </div>
        )}
      </div>

      {/* AI Feedback Modal */}
      {showAIFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              {isGeneratingFeedback ? (
                <>
                  <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating AI Feedback</h3>
                  <p className="text-gray-600">Analyzing your journal entry...</p>
                </>
              ) : (
                <>
                  <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                    AI Feedback
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <p className="text-purple-800 text-sm leading-relaxed">{aiFeedback}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowAIFeedback(false);
                        setAiFeedback('');
                        setSelectedEntry(null);
                      }}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSaveFeedback}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      Save Feedback
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;