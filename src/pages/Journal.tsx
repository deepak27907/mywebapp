import React, { useState } from 'react';
import { Plus, Edit, Trash2, MoreVertical, BookOpen, Heart, Target, Sparkles, X, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JournalEntry } from '../types';
import { aiService } from '../services/ai';

const Journal: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useApp();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category: 'reflection' as 'study' | 'personal' | 'reflection' | 'goal',
    tags: [] as string[],
    isPrivate: false
  });

  const preSavedEntries = [
    {
      title: "Today's Study Session",
      content: "How did your study session go today? What did you learn? What challenges did you face?",
      category: 'study' as const,
      tags: ['study', 'learning']
    },
    {
      title: "Goal Reflection",
      content: "Reflect on your current goals. Are you making progress? What adjustments do you need to make?",
      category: 'goal' as const,
      tags: ['goals', 'progress']
    },
    {
      title: "Personal Check-in",
      content: "How are you feeling today? What's on your mind? Any personal challenges or victories?",
      category: 'personal' as const,
      tags: ['personal', 'wellbeing']
    },
    {
      title: "Academic Challenge",
      content: "Describe a challenging topic or concept you're studying. What makes it difficult? How can you approach it differently?",
      category: 'study' as const,
      tags: ['study', 'challenge']
    },
    {
      title: "Future Planning",
      content: "What are your plans for the upcoming week/month? How will you prepare for your target exam?",
      category: 'goal' as const,
      tags: ['planning', 'future']
    }
  ];

  const categories = [
    { value: 'study', label: 'Study', icon: BookOpen, color: 'text-blue-600' },
    { value: 'personal', label: 'Personal', icon: Heart, color: 'text-pink-600' },
    { value: 'reflection', label: 'Reflection', icon: Sparkles, color: 'text-purple-600' },
    { value: 'goal', label: 'Goal', icon: Target, color: 'text-green-600' }
  ];

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    const entry: Omit<JournalEntry, 'id'> = {
      title: newEntry.title,
      content: newEntry.content,
      date: new Date(),
      category: newEntry.category,
      tags: newEntry.tags,
      isPrivate: newEntry.isPrivate
    };

    await addJournalEntry(entry);
    setNewEntry({
      title: '',
      content: '',
      category: 'reflection',
      tags: [],
      isPrivate: false
    });
    setIsAddingEntry(false);
  };



  const handleDeleteEntry = async (entryId: string) => {
    await deleteJournalEntry(entryId);
    setShowDeleteConfirm(null);
  };

  const handleGenerateFeedback = async (content: string, entryId: string) => {
    setIsGeneratingFeedback(true);
    try {
      const feedback = await aiService.generateJournalFeedback(content, []);
      await updateJournalEntry(entryId, { aiFeedback: feedback.feedback });
    } catch (error) {
      console.error('Error generating feedback:', error);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleUseTemplate = (template: typeof preSavedEntries[0]) => {
    setNewEntry({
      title: template.title,
      content: template.content,
      category: template.category,
      tags: template.tags,
      isPrivate: false
    });
    setIsAddingEntry(true);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    if (!cat) return Sparkles;
    return cat.icon;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-600">Reflect on your academic journey and personal growth</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddingEntry(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </button>
        </div>
      </div>

      {/* Pre-saved Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preSavedEntries.map((template, index) => {
            const IconComponent = getCategoryIcon(template.category);
            return (
              <button
                key={index}
                onClick={() => handleUseTemplate(template)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 text-left"
              >
                <div className="flex items-center mb-2">
                  <IconComponent className={`w-4 h-4 mr-2 ${getCategoryColor(template.category)}`} />
                  <span className="text-sm font-medium text-gray-900">{template.title}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-3">{template.content}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Add Entry Modal */}
      {isAddingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Journal Entry</h2>
              <button
                onClick={() => {
                  setIsAddingEntry(false);
                  setNewEntry({
                    title: '',
                    content: '',
                    category: 'reflection',
                    tags: [],
                    isPrivate: false
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter entry title"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => setNewEntry({ ...newEntry, category: category.value as 'study' | 'personal' | 'reflection' | 'goal' })}
                          className={`p-3 rounded-lg border-2 transition-colors flex items-center ${
                            newEntry.category === category.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <IconComponent className={`w-4 h-4 mr-2 ${category.color}`} />
                          <span className="text-sm">{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={8}
                    placeholder="Write your thoughts, reflections, or experiences..."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newEntry.isPrivate}
                    onChange={(e) => setNewEntry({ ...newEntry, isPrivate: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                    Make this entry private
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEntry(false);
                    setNewEntry({
                      title: '',
                      content: '',
                      category: 'reflection',
                      tags: [],
                      isPrivate: false
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal Entries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Entries</h2>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">Total: {journalEntries.length}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {journalEntries.map((entry) => {
            const IconComponent = getCategoryIcon(entry.category);
            return (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <IconComponent className={`w-4 h-4 mr-2 ${getCategoryColor(entry.category)}`} />
                      <h3 className="font-medium text-gray-900">{entry.title}</h3>
                      {entry.isPrivate && (
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{entry.content}</p>
                    {entry.aiFeedback && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-900">AI Feedback</span>
                        </div>
                        <p className="text-sm text-blue-800">{entry.aiFeedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setEditingEntry(editingEntry?.id === entry.id ? null : entry)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    {editingEntry?.id === entry.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                        <button
                          onClick={() => handleGenerateFeedback(entry.content, entry.id)}
                          disabled={isGeneratingFeedback}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                        >
                          {isGeneratingFeedback ? (
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 mr-2" />
                          )}
                          {isGeneratingFeedback ? 'Generating...' : 'Get AI Feedback'}
                        </button>
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                        >
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(entry.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full ${getCategoryColor(entry.category)} bg-opacity-10`}>
                      {categories.find(c => c.value === entry.category)?.label}
                    </span>
                    <span>{entry.date.toLocaleDateString()}</span>
                  </div>
                  {!entry.aiFeedback && (
                    <button
                      onClick={() => handleGenerateFeedback(entry.content, entry.id)}
                      disabled={isGeneratingFeedback}
                      className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                    >
                      {isGeneratingFeedback ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      Get AI Feedback
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Entry</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEntry(showDeleteConfirm)}
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

export default Journal;