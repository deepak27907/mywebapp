import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, MoodEntry, JournalEntry, ChatMessage, ChatSession } from '../types';
import { firebaseService } from '../services/firebase';

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
  deleteJournalEntry: (entryId: string) => Promise<void>;
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  deleteChatMessage: (messageId: string) => Promise<void>;
  clearChatMessages: () => Promise<void>;
  chatSessions: ChatSession[];
  addChatSession: (session: Omit<ChatSession, 'id'>) => Promise<void>;
  updateChatSession: (sessionId: string, updates: Partial<ChatSession>) => Promise<void>;
  deleteChatSession: (sessionId: string) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const isAuthenticated = !!user;

  // Initialize authentication state with timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          console.warn('Firebase auth initialization timeout - setting loading to false');
          setLoading(false);
        }, 5000); // 5 second timeout

        const unsubscribe = firebaseService.onAuthStateChanged(async (firebaseUser) => {
          clearTimeout(timeoutId);
          
          if (firebaseUser) {
            try {
              const userData = await firebaseService.getUser(firebaseUser.uid);
              if (userData) {
                setUser(userData);
              }
            } catch (error) {
              console.error('Error loading user data:', error);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => {
          clearTimeout(timeoutId);
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing authentication:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    const cleanup = initializeAuth();
    return () => {
      clearTimeout(timeoutId);
      cleanup.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  // Load user data when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const [userTasks, userMoodEntries, userJournalEntries, userChatMessages, userChatSessions] = await Promise.all([
            firebaseService.getTasks(user.id),
            firebaseService.getMoodEntries(user.id),
            firebaseService.getJournalEntries(user.id),
            firebaseService.getChatMessages(user.id),
            firebaseService.getChatSessions(user.id)
          ]);
          
          setTasks(userTasks);
          setMoodEntries(userMoodEntries);
          setJournalEntries(userJournalEntries);
          setChatMessages(userChatMessages);
          setChatSessions(userChatSessions);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setTasks([]);
        setMoodEntries([]);
        setJournalEntries([]);
        setChatMessages([]);
        setChatSessions([]);
      }
    };

    loadUserData();
  }, [user]);

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

  const deleteJournalEntry = async (entryId: string) => {
    try {
      await firebaseService.deleteJournalEntry(entryId);
      setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  const addChatMessage = async (message: Omit<ChatMessage, 'id'>) => {
    if (!user) {
      console.warn('Cannot add chat message: user not authenticated');
      return;
    }
    
    try {
      const messageWithUserId = { ...message, userId: user.id };
      const messageId = await firebaseService.addChatMessage(messageWithUserId);
      const newMessage = { ...message, id: messageId };
      setChatMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error adding chat message:', error);
      
      // Provide user-friendly error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('permission') || errorMessage.includes('Missing or insufficient permissions')) {
        console.warn('Firebase permissions issue - message saved locally');
        // Still add the message locally for better UX
        const localMessageId = Date.now().toString();
        const newMessage = { ...message, id: localMessageId };
        setChatMessages(prev => [...prev, newMessage]);
      } else {
        // For other errors, show a user-friendly notification
        console.error('Failed to save chat message:', error);
      }
    }
  };

  const deleteChatMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      await firebaseService.deleteChatMessage(messageId);
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting chat message:', error);
    }
  };

  const clearChatMessages = async () => {
    if (!user) return;
    
    try {
      await firebaseService.clearChatMessages(user.id);
      setChatMessages([]);
    } catch (error) {
      console.error('Error clearing chat messages:', error);
    }
  };

  const addChatSession = async (session: Omit<ChatSession, 'id'>) => {
    if (!user) return;
    
    try {
      const sessionWithUserId = { ...session, userId: user.id };
      const sessionId = await firebaseService.addChatSession(sessionWithUserId);
      const newSession = { ...session, id: sessionId };
      setChatSessions(prev => [...prev, newSession]);
    } catch (error) {
      console.error('Error adding chat session:', error);
    }
  };

  const updateChatSession = async (sessionId: string, updates: Partial<ChatSession>) => {
    if (!user) return;
    
    try {
      await firebaseService.updateChatSession(sessionId, updates);
      setChatSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? { ...session, ...updates } : session
        )
      );
    } catch (error) {
      console.error('Error updating chat session:', error);
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    if (!user) return;
    
    try {
      await firebaseService.deleteChatSession(sessionId);
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const firebaseUser = await firebaseService.signInWithEmailAndPassword(email, password);
      const userData = await firebaseService.getUser(firebaseUser.uid);
      if (userData) {
        setUser(userData);
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    try {
      const firebaseUser = await firebaseService.createUserWithEmailAndPassword(email, password);
      const newUser: User = {
        id: firebaseUser.uid,
        name: userData.name || '',
        email: email,
        ...userData
      };
      await firebaseService.createUser(newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseService.signOut();
      setUser(null);
      setTasks([]);
      setMoodEntries([]);
      setJournalEntries([]);
      setChatMessages([]);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
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
        deleteJournalEntry,
        chatMessages,
        addChatMessage,
        deleteChatMessage,
        clearChatMessages,
        chatSessions,
        addChatSession,
        updateChatSession,
        deleteChatSession,
        isAuthenticated,
        loading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AppContext.Provider>
  );
};