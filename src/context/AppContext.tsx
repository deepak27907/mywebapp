import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, MoodEntry, JournalEntry, ChatMessage } from '../types';
import { firebaseService } from '../services/firebase';
import { aiService } from '../services/ai';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => Promise<void>;
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  updateJournalEntry: (entryId: string, updates: Partial<JournalEntry>) => Promise<void>;
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;

  // Load data from Firebase when user is authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        try {
          // Clear AI cache when user logs in to get fresh suggestions
          aiService.clearCache();
          
          const [tasksData, moodData, journalData, chatData] = await Promise.all([
            firebaseService.getTasks(user.id),
            firebaseService.getMoodEntries(user.id),
            firebaseService.getJournalEntries(user.id),
            firebaseService.getChatMessages(user.id)
          ]);
          setTasks(tasksData);
          setMoodEntries(moodData);
          setJournalEntries(journalData);
          setChatMessages(chatData);
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [isAuthenticated, user]);

  const addTask = async (task: Omit<Task, 'id'>) => {
    if (!user) return;
    try {
      const taskWithUserId = { ...task, userId: user.id };
      const taskId = await firebaseService.addTask(taskWithUserId);
      const newTask = { ...task, id: taskId };
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await firebaseService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await firebaseService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addMoodEntry = async (entry: Omit<MoodEntry, 'id'>) => {
    if (!user) return;
    try {
      const entryWithUserId = { ...entry, userId: user.id };
      const entryId = await firebaseService.addMoodEntry(entryWithUserId);
      const newEntry = { ...entry, id: entryId };
      setMoodEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Error adding mood entry:', error);
    }
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    if (!user) return;
    try {
      const entryWithUserId = { ...entry, userId: user.id };
      const entryId = await firebaseService.addJournalEntry(entryWithUserId);
      const newEntry = { ...entry, id: entryId };
      setJournalEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
    try {
      await firebaseService.updateJournalEntry(entryId, updates);
      setJournalEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, ...updates } : entry
      ));
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  };

  const addChatMessage = async (message: Omit<ChatMessage, 'id'>) => {
    if (!user) return;
    try {
      const messageWithUserId = { ...message, userId: user.id };
      const messageId = await firebaseService.addChatMessage(messageWithUserId);
      const newMessage = { ...message, id: messageId };
      setChatMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error adding chat message:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
        moodEntries,
        addMoodEntry,
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        chatMessages,
        addChatMessage,
        isAuthenticated,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};