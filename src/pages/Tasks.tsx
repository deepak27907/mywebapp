import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Bot, Calendar, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { aiService } from '../services/ai';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSuppressWarnings } from '../utils/useSuppressWarnings';

const Tasks: React.FC = () => {
  useSuppressWarnings(); // Suppress React Beautiful DnD warnings
  
  const { tasks, setTasks, addTask, moodEntries, user } = useApp();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAISorting, setIsAISorting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const columns = {
    todo: { id: 'todo', title: 'To Do', tasks: tasks.filter(t => t.status === 'todo') },
    'in-progress': { id: 'in-progress', title: 'In Progress', tasks: tasks.filter(t => t.status === 'in-progress') },
    done: { id: 'done', title: 'Done', tasks: tasks.filter(t => t.status === 'done') }
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const updatedTasks = tasks.map(task => {
      if (task.id === draggableId) {
        return { ...task, status: destination.droppableId as Task['status'] };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Omit<Task, 'id'> = {
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      createdAt: new Date()
    };

    await addTask(task);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setIsAddingTask(false);
    setSubtasks([]);
    setShowSubtasks(false);
  };

  const handleAISort = async () => {
    setIsAISorting(true);
    try {
      const recentMoodLogs = moodEntries.slice(0, 7);
      const result = await aiService.sortTasksByMood(tasks, recentMoodLogs, user?.id || '');
      
      // Reorder tasks based on AI response
      const sortedTasks = result.sortedTasks.map(taskId => 
        tasks.find(task => task.id === taskId)
      ).filter(Boolean) as Task[];
      
      // Add remaining tasks that weren't in the AI response
      const remainingTasks = tasks.filter(task => 
        !result.sortedTasks.includes(task.id)
      );
      
      setTasks([...sortedTasks, ...remainingTasks]);
    } catch (error) {
      console.error('Error sorting tasks:', error);
    } finally {
      setIsAISorting(false);
    }
  };

  const handleTaskBreakdown = async (taskTitle: string) => {
    try {
      const result = await aiService.breakDownTask(taskTitle, user?.id || '');
      setSubtasks(result.subtasks);
      setShowSubtasks(true);
    } catch (error) {
      console.error('Error breaking down task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Organize and track your academic tasks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAISort}
            disabled={isAISorting}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isAISorting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bot className="w-4 h-4 mr-2" />
            )}
            {isAISorting ? 'Sorting...' : 'AI Sort'}
          </button>
          <button
            onClick={() => setIsAddingTask(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task title"
                    autoFocus
                  />
                </div>
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
                {newTask.title && (
                  <div>
                    <button
                      type="button"
                      onClick={() => handleTaskBreakdown(newTask.title)}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Break down into subtasks
                    </button>
                  </div>
                )}
                {showSubtasks && subtasks.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Suggested Subtasks:</h4>
                    <ul className="space-y-1">
                      {subtasks.map((subtask, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          {subtask}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTask(false);
                    setSubtasks([]);
                    setShowSubtasks(false);
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

      {/* Kanban Board */}
      <ErrorBoundary>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(columns).map((column) => (
              <div key={column.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center justify-between">
                    {column.title}
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {column.tasks.length}
                    </span>
                  </h2>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[400px] transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="space-y-3">
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white border border-gray-200 rounded-lg p-4 cursor-move transition-all duration-200 hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
                                  <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {task.createdAt.toLocaleDateString()}
                                  </div>
                                  {task.dueDate && (
                                    <div className="flex items-center text-orange-600">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Due {task.dueDate.toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </ErrorBoundary>
    </div>
  );
};

export default Tasks;