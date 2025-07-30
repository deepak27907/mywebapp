import React, { useState } from 'react';
import { Plus, Calendar, AlertCircle, Sparkles, Loader2, X, Check, Edit, Trash2, MoreVertical, BookOpen, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { aiService, AITaskParseResponse } from '../services/ai';

const Tasks: React.FC = () => {
  const { tasks, addTask, deleteTask, user } = useApp();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isParsingInput, setIsParsingInput] = useState(false);
  const [rawTaskInput, setRawTaskInput] = useState('');
  const [parsedTask, setParsedTask] = useState<AITaskParseResponse | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    time: '',
    taskType: 'personal' as 'academic' | 'personal',
    subject: '',
    topic: '',
    estimatedTime: 60
  });

  const subjects = {
    NEET: ['Physics', 'Chemistry', 'Biology', 'English', 'Hindi'],
    JEE: ['Physics', 'Chemistry', 'Mathematics', 'English']
  };

  const handleSmartInput = async () => {
    if (!rawTaskInput.trim()) return;
    setIsParsingInput(true);
    try {
      const parsed = await aiService.parseTaskInput(rawTaskInput);
      setParsedTask(parsed);
      setNewTask({
        title: parsed.title,
        description: parsed.description || '',
        priority: parsed.priority,
        dueDate: parsed.dueDate || '',
        time: parsed.time || '',
        taskType: 'personal',
        subject: '',
        topic: '',
        estimatedTime: 60
      });
    } catch (error) {
      console.error('Error parsing task input:', error);
      setNewTask({
        title: rawTaskInput,
        description: '',
        priority: 'medium',
        dueDate: '',
        time: '',
        taskType: 'personal',
        subject: '',
        topic: '',
        estimatedTime: 60
      });
    } finally {
      setIsParsingInput(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Omit<Task, 'id'> = {
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      createdAt: new Date(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      taskType: newTask.taskType,
      subject: newTask.subject,
      topic: newTask.topic,
      estimatedTime: newTask.estimatedTime
    };

    await addTask(task);
    setNewTask({ 
      title: '', description: '', priority: 'medium', dueDate: '', time: '',
      taskType: 'personal', subject: '', topic: '', estimatedTime: 60
    });
    setIsAddingTask(false);
    setRawTaskInput('');
    setParsedTask(null);
  };



  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setShowDeleteConfirm(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'done': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date() > dueDate;
  };

  const isDueToday = (dueDate?: Date) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return today.toDateString() === due.toDateString();
  };

  const isDueSoon = (dueDate?: Date) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Organize and track your academic & personal tasks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddingTask(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Enhanced Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Task</h2>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setRawTaskInput('');
                  setParsedTask(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Input Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Add (AI-Powered)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rawTaskInput}
                  onChange={(e) => setRawTaskInput(e.target.value)}
                  placeholder="e.g., Study Physics tomorrow at 4pm high priority"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isParsingInput}
                />
                <button
                  type="button"
                  onClick={handleSmartInput}
                  disabled={!rawTaskInput.trim() || isParsingInput}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isParsingInput ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Type naturally and AI will parse the details
              </p>
            </div>

            {/* Parsed Results */}
            {parsedTask && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-green-900">AI Parsed Results:</h4>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Title:</strong> {parsedTask.title}</p>
                  {parsedTask.dueDate && <p><strong>Due:</strong> {parsedTask.dueDate}</p>}
                  {parsedTask.time && <p><strong>Time:</strong> {parsedTask.time}</p>}
                  <p><strong>Priority:</strong> {parsedTask.priority}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAddTask}>
              <div className="space-y-4">
                {/* Task Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTask({ ...newTask, taskType: 'personal' })}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                        newTask.taskType === 'personal'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <User className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-sm">Personal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTask({ ...newTask, taskType: 'academic' })}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                        newTask.taskType === 'academic'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-sm">Academic</span>
                    </button>
                  </div>
                </div>

                {/* Subject Selection for Academic Tasks */}
                {newTask.taskType === 'academic' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select subject</option>
                      {user?.targetExam && subjects[user.targetExam as keyof typeof subjects]?.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={newTask.taskType === 'academic' ? "e.g., Newton's Laws" : "Enter task title"}
                    autoFocus
                    required
                  />
                </div>

                {newTask.taskType === 'academic' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic (Optional)
                    </label>
                    <input
                      type="text"
                      value={newTask.topic}
                      onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Mechanics, Thermodynamics"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add task description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Est. Time (min)
                    </label>
                    <input
                      type="number"
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) || 60 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="15"
                      step="15"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTask(false);
                    setRawTaskInput('');
                    setParsedTask(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task List with Status Filtering */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Tasks</h2>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">Total: {tasks.length}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    {task.taskType === 'academic' && (
                      <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                    )}
                    {task.taskType === 'personal' && (
                      <User className="w-4 h-4 mr-2 text-green-600" />
                    )}
                    {task.title}
                  </h3>
                  {task.subject && (
                    <p className="text-xs text-blue-600 mt-1">
                      {task.subject}{task.topic && ` • ${task.topic}`}
                    </p>
                  )}
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setEditingTask(editingTask?.id === task.id ? null : task)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    {editingTask?.id === task.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                        >
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(task.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {task.createdAt.toLocaleDateString()}
                  </div>
                  {task.estimatedTime && (
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                      {task.estimatedTime}min
                    </div>
                  )}
                </div>
                {task.dueDate && (
                  <div className={`flex items-center ${
                    isOverdue(task.dueDate) ? 'text-red-600' :
                    isDueToday(task.dueDate) ? 'text-orange-600' :
                    isDueSoon(task.dueDate) ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {isOverdue(task.dueDate) ? 'Overdue' :
                     isDueToday(task.dueDate) ? 'Due today' :
                     isDueSoon(task.dueDate) ? 'Due soon' :
                     `Due ${task.dueDate.toLocaleDateString()}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(showDeleteConfirm)}
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

export default Tasks; 