import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { User, Task, MoodEntry, JournalEntry, ChatMessage, ChatSession } from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app: any;
let db: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = null;
  db = null;
  auth = null;
}

// Check if Firebase config is valid
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId && 
         firebaseConfig.apiKey !== 'your_firebase_api_key_here';
};

// Mock data storage for fallback
const mockData = {
  users: new Map<string, User>(),
  tasks: new Map<string, Task[]>(),
  moodEntries: new Map<string, MoodEntry[]>(),
  journalEntries: new Map<string, JournalEntry[]>(),
  chatMessages: new Map<string, ChatMessage[]>()
};

// Helper function to convert timestamps
const convertTimestamp = (timestamp: unknown): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
    // Firestore Timestamp
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  // Fallback to current date
  return new Date();
};

// Helper function to clean undefined values from objects
const cleanObjectForFirebase = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

class FirebaseService {
  private isFirebaseAvailable(): boolean {
    return db !== null && auth !== null && isFirebaseConfigured();
  }

  // Authentication methods
  async signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser> {
    if (!this.isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser> {
    if (!this.isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!this.isFirebaseAvailable()) {
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (!this.isFirebaseAvailable()) {
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser(): FirebaseUser | null {
    if (!this.isFirebaseAvailable()) {
      return null;
    }
    return auth.currentUser;
  }

  // User operations
  async createUser(user: User): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await setDoc(doc(db, 'users', user.id), user);
        console.log('User created in Firebase:', user);
      } catch (error) {
        console.error('Error creating user in Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      mockData.users.set(user.id, user);
      console.log('User created in mock storage:', user);
    }
  }

  async getUser(userId: string): Promise<User | null> {
    if (this.isFirebaseAvailable()) {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() as User : null;
      } catch (error) {
        console.error('Error getting user from Firebase:', error);
        return null;
      }
    } else {
      // Fallback to mock data
      return mockData.users.get(userId) || null;
    }
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            dueDate: data.dueDate ? convertTimestamp(data.dueDate) : undefined
          } as Task;
        });
      } catch (error: unknown) {
        console.error('Error getting tasks from Firebase:', error);
        return [];
      }
    } else {
      // Fallback to mock data
      return mockData.tasks.get(userId) || [];
    }
  }

  async addTask(task: Omit<Task, 'id'>): Promise<string> {
    if (this.isFirebaseAvailable()) {
      try {
        // Ensure userId is included from authenticated user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        // Filter out undefined values to prevent Firebase errors
        const cleanTask = cleanObjectForFirebase(task);
        
        const taskWithUserId = {
          ...cleanTask,
          userId: currentUser.uid
        };
        
        const docRef = await addDoc(collection(db, 'tasks'), taskWithUserId);
        return docRef.id;
      } catch (error) {
        console.error('Error adding task to Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      const taskId = Date.now().toString();
      const newTask = { ...task, id: taskId };
      const userTasks = mockData.tasks.get(task.userId || '') || [];
      userTasks.unshift(newTask);
      mockData.tasks.set(task.userId || '', userTasks);
      return taskId;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await updateDoc(doc(db, 'tasks', taskId), updates);
      } catch (error) {
        console.error('Error updating task in Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      for (const [, tasks] of mockData.tasks.entries()) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
          break;
        }
      }
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
      } catch (error) {
        console.error('Error deleting task from Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      for (const [userId, tasks] of mockData.tasks.entries()) {
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        mockData.tasks.set(userId, filteredTasks);
      }
    }
  }

  // Mood operations
  async getMoodEntries(userId: string, limitCount: number = 7): Promise<MoodEntry[]> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'moodEntries'),
          where('userId', '==', userId),
          orderBy('date', 'desc'),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: convertTimestamp(data.date)
          } as MoodEntry;
        });
      } catch (error: unknown) {
        console.error('Error getting mood entries from Firebase:', error);
        
        // Handle index building error specifically
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = (error as { code?: string }).code;
        if (errorCode === 'failed-precondition' || errorMessage?.includes('index')) {
          console.warn('Firebase index is still building. Using fallback query...');
          try {
            // Fallback: query without orderBy to avoid index requirement
            const fallbackQuery = query(
              collection(db, 'moodEntries'),
              where('userId', '==', userId),
              limit(limitCount)
            );
            const querySnapshot = await getDocs(fallbackQuery);
            const entries = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                date: convertTimestamp(data.date)
              } as MoodEntry;
            });
            
            // Sort manually in memory
            return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            return [];
          }
        }
        
        return [];
      }
    } else {
      // Fallback to mock data
      const entries = mockData.moodEntries.get(userId) || [];
      return entries.slice(0, limitCount);
    }
  }

  async addMoodEntry(entry: Omit<MoodEntry, 'id'>): Promise<string> {
    if (this.isFirebaseAvailable()) {
      try {
        // Ensure userId is included from authenticated user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        // Filter out undefined values to prevent Firebase errors
        const cleanEntry = cleanObjectForFirebase(entry);
        
        const entryWithUserId = {
          ...cleanEntry,
          userId: currentUser.uid
        };
        
        const docRef = await addDoc(collection(db, 'moodEntries'), entryWithUserId);
        return docRef.id;
      } catch (error) {
        console.error('Error adding mood entry to Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      const entryId = Date.now().toString();
      const newEntry = { ...entry, id: entryId };
      const userEntries = mockData.moodEntries.get(entry.userId || '') || [];
      userEntries.unshift(newEntry);
      mockData.moodEntries.set(entry.userId || '', userEntries);
      return entryId;
    }
  }

  // Journal operations
  async getJournalEntries(userId: string, limitCount: number = 10): Promise<JournalEntry[]> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'journalEntries'),
          where('userId', '==', userId),
          orderBy('date', 'desc'),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: convertTimestamp(data.date)
          } as JournalEntry;
        });
      } catch (error: any) {
        console.error('Error getting journal entries from Firebase:', error);
        
        // Handle index building error specifically
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          console.warn('Firebase index is still building. Using fallback query...');
          try {
            // Fallback: query without orderBy to avoid index requirement
            const fallbackQuery = query(
              collection(db, 'journalEntries'),
              where('userId', '==', userId),
              limit(limitCount)
            );
            const querySnapshot = await getDocs(fallbackQuery);
            const entries = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                date: convertTimestamp(data.date)
              } as JournalEntry;
            });
            
            // Sort manually in memory
            return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            return [];
          }
        }
        
        return [];
      }
    } else {
      // Fallback to mock data
      const entries = mockData.journalEntries.get(userId) || [];
      return entries.slice(0, limitCount);
    }
  }

  async addJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<string> {
    if (this.isFirebaseAvailable()) {
      try {
        // Ensure userId is included from authenticated user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        // Filter out undefined values to prevent Firebase errors
        const cleanEntry = cleanObjectForFirebase(entry);
        
        const entryWithUserId = {
          ...cleanEntry,
          userId: currentUser.uid
        };
        
        const docRef = await addDoc(collection(db, 'journalEntries'), entryWithUserId);
        return docRef.id;
      } catch (error) {
        console.error('Error adding journal entry to Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      const entryId = Date.now().toString();
      const newEntry = { ...entry, id: entryId };
      const userEntries = mockData.journalEntries.get(entry.userId || '') || [];
      userEntries.unshift(newEntry);
      mockData.journalEntries.set(entry.userId || '', userEntries);
      return entryId;
    }
  }

  async updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await updateDoc(doc(db, 'journalEntries', entryId), updates);
      } catch (error) {
        console.error('Error updating journal entry in Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      for (const [, entries] of mockData.journalEntries.entries()) {
        const entryIndex = entries.findIndex(entry => entry.id === entryId);
        if (entryIndex !== -1) {
          entries[entryIndex] = { ...entries[entryIndex], ...updates };
          break;
        }
      }
    }
  }

  async deleteJournalEntry(entryId: string): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await deleteDoc(doc(db, 'journalEntries', entryId));
      } catch (error) {
        console.error('Error deleting journal entry in Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      for (const [, entries] of mockData.journalEntries.entries()) {
        const entryIndex = entries.findIndex(entry => entry.id === entryId);
        if (entryIndex !== -1) {
          entries.splice(entryIndex, 1);
          break;
        }
      }
    }
  }

  // Chat operations
  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'chatMessages'),
          where('userId', '==', userId),
          orderBy('timestamp', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: convertTimestamp(data.timestamp)
          } as ChatMessage;
        });
      } catch (error) {
        console.error('Error getting chat messages from Firebase:', error);
        return [];
      }
    } else {
      // Fallback to mock data
      return mockData.chatMessages.get(userId) || [];
    }
  }

  async deleteChatMessage(messageId: string): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await deleteDoc(doc(db, 'chatMessages', messageId));
      } catch (error) {
        console.error('Error deleting chat message from Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      for (const [userId, messages] of mockData.chatMessages.entries()) {
        const filteredMessages = messages.filter(msg => msg.id !== messageId);
        mockData.chatMessages.set(userId, filteredMessages);
      }
    }
  }

  async clearChatMessages(userId: string): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'chatMessages'),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error clearing chat messages from Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      mockData.chatMessages.set(userId, []);
    }
  }

  // Chat Session operations
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'chatSessions'),
          where('userId', '==', userId),
          orderBy('lastMessageAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            lastMessageAt: convertTimestamp(data.lastMessageAt)
          } as ChatSession;
        });
      } catch (error) {
        console.error('Error getting chat sessions from Firebase:', error);
        return [];
      }
    } else {
      // Fallback to mock data
      return [];
    }
  }

  async addChatSession(session: Omit<ChatSession, 'id'>): Promise<string> {
    if (this.isFirebaseAvailable()) {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const sessionWithUserId = {
          ...session,
          userId: currentUser.uid
        };
        
        const docRef = await addDoc(collection(db, 'chatSessions'), sessionWithUserId);
        return docRef.id;
      } catch (error) {
        console.error('Error adding chat session to Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      const sessionId = Date.now().toString();
      return sessionId;
    }
  }

  async updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await updateDoc(doc(db, 'chatSessions', sessionId), updates);
      } catch (error) {
        console.error('Error updating chat session in Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      console.log('Chat session updated in mock storage:', updates);
    }
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await deleteDoc(doc(db, 'chatSessions', sessionId));
      } catch (error) {
        console.error('Error deleting chat session from Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      console.log('Chat session deleted from mock storage:', sessionId);
    }
  }

  async addChatMessage(message: Omit<ChatMessage, 'id'>): Promise<string> {
    if (this.isFirebaseAvailable()) {
      try {
        // Check if user is authenticated
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.warn('User not authenticated, using fallback storage');
          return this.addChatMessageFallback(message);
        }

        // Filter out undefined values to prevent Firebase errors
        const cleanMessage = cleanObjectForFirebase(message);

        const docRef = await addDoc(collection(db, 'chatMessages'), {
          ...cleanMessage,
          userId: currentUser.uid, // Ensure userId is included
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error adding chat message to Firebase:', error);
        
        // Check if it's a permissions error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('permission') || errorMessage.includes('Missing or insufficient permissions')) {
          console.warn('Firebase permissions error, using fallback storage');
          return this.addChatMessageFallback(message);
        }
        
        throw error;
      }
    } else {
      console.warn('Firebase not available, using fallback storage');
      return this.addChatMessageFallback(message);
    }
  }

  private addChatMessageFallback(message: Omit<ChatMessage, 'id'>): string {
    const messageId = Date.now().toString();
    const newMessage = { ...message, id: messageId };
    const userMessages = mockData.chatMessages.get(message.userId || '') || [];
    userMessages.push(newMessage);
    mockData.chatMessages.set(message.userId || '', userMessages);
    return messageId;
  }

  // New methods for enhanced features

  // Progress Reports
  async addProgressReport(report: {
    userId: string;
    moodTrend: string;
    productivityInsight: string;
    journalThemes: string;
    recommendations: string[];
  }): Promise<string> {
    if (this.isFirebaseAvailable()) {
      try {
        const docRef = await addDoc(collection(db, 'progressReports'), {
          ...report,
          reportDate: new Date(),
          createdAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error adding progress report to Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      const reportId = Date.now().toString();
      return reportId;
    }
  }

  async getProgressReports(userId: string, limitCount: number = 5): Promise<Array<Record<string, unknown>>> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'progressReports'),
          where('userId', '==', userId),
          orderBy('reportDate', 'desc'),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            reportDate: convertTimestamp(data.reportDate),
            createdAt: convertTimestamp(data.createdAt)
          };
        });
      } catch (error) {
        console.error('Error getting progress reports from Firebase:', error);
        return [];
      }
    } else {
      // Fallback to mock data
      return [];
    }
  }

  // Weekly Reports
  async addWeeklyReport(report: {
    userId: string;
    summary: string;
    moodAnalysis: string;
    taskAnalysis: string;
    journalInsights: string;
    nextWeekGoals: string[];
  }): Promise<string> {
    if (this.isFirebaseAvailable()) {
      try {
        const docRef = await addDoc(collection(db, 'weeklyReports'), {
          ...report,
          weekStartDate: new Date(),
          createdAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error adding weekly report to Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      const reportId = Date.now().toString();
      return reportId;
    }
  }

  async getWeeklyReports(userId: string, limitCount: number = 4): Promise<Array<Record<string, unknown>>> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'weeklyReports'),
          where('userId', '==', userId),
          orderBy('weekStartDate', 'desc'),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            weekStartDate: convertTimestamp(data.weekStartDate),
            createdAt: convertTimestamp(data.createdAt)
          };
        });
      } catch (error) {
        console.error('Error getting weekly reports from Firebase:', error);
        return [];
      }
    } else {
      // Fallback to mock data
      return [];
    }
  }

  // User Analytics
  async updateUserAnalytics(userId: string, analytics: {
    streakCount: number;
    averageEnergy: number;
    averageFocus: number;
    mostCommonMood: string;
    taskCompletionRate: number;
  }): Promise<void> {
    if (this.isFirebaseAvailable()) {
      try {
        await setDoc(doc(db, 'userAnalytics', userId), {
          ...analytics,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error updating user analytics in Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      console.log('User analytics updated in mock storage:', analytics);
    }
  }

  async getUserAnalytics(userId: string): Promise<Record<string, unknown> | null> {
    if (this.isFirebaseAvailable()) {
      try {
        const docRef = doc(db, 'userAnalytics', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            ...data,
            lastUpdated: convertTimestamp(data.lastUpdated)
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting user analytics from Firebase:', error);
        return null;
      }
    } else {
      // Fallback to mock data
      return null;
    }
  }

  // Enhanced Task Methods
  async getTasksByStatus(userId: string, status: 'todo' | 'in-progress' | 'done'): Promise<Task[]> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            dueDate: data.dueDate ? convertTimestamp(data.dueDate) : undefined
          } as Task;
        });
      } catch (error: any) {
        console.error('Error getting tasks by status from Firebase:', error);
        return [];
      }
    } else {
      // Fallback to mock data
      const userTasks = mockData.tasks.get(userId) || [];
      return userTasks.filter(task => task.status === status);
    }
  }

  async getTasksByPriority(userId: string, priority: 'low' | 'medium' | 'high'): Promise<Task[]> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          where('priority', '==', priority),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            dueDate: data.dueDate ? convertTimestamp(data.dueDate) : undefined
          } as Task;
        });
      } catch (error: any) {
        console.error('Error getting tasks by priority from Firebase:', error);
        return [];
      }
    } else {
      // Fallback to mock data
      const userTasks = mockData.tasks.get(userId) || [];
      return userTasks.filter(task => task.priority === priority);
    }
  }

  // Enhanced Mood Methods
  async getMoodEntriesByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<MoodEntry[]> {
    if (this.isFirebaseAvailable()) {
      try {
        const q = query(
          collection(db, 'moodEntries'),
          where('userId', '==', userId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: convertTimestamp(data.date)
          } as MoodEntry;
        });
      } catch (error: any) {
        console.error('Error getting mood entries by date range from Firebase:', error);
        return [];
      }
    } else {
      // Fallback to mock data
      const userEntries = mockData.moodEntries.get(userId) || [];
      return userEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }
  }

  async getMoodStats(userId: string): Promise<{
    totalEntries: number;
    averageEnergy: number;
    averageFocus: number;
    mostCommonMood: string;
    streakCount: number;
  }> {
    const entries = await this.getMoodEntries(userId, 100); // Get more entries for stats
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageEnergy: 0,
        averageFocus: 0,
        mostCommonMood: 'No data',
        streakCount: 0
      };
    }

    // Calculate averages
    const totalEnergy = entries.reduce((sum, entry) => sum + entry.energy, 0);
    const totalFocus = entries.reduce((sum, entry) => sum + entry.focus, 0);
    const averageEnergy = Math.round(totalEnergy / entries.length);
    const averageFocus = Math.round(totalFocus / entries.length);

    // Find most common mood
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Calculate streak (simplified)
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streakCount = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streakCount++;
      } else {
        break;
      }
    }

    return {
      totalEntries: entries.length,
      averageEnergy,
      averageFocus,
      mostCommonMood,
      streakCount
    };
  }
}

export const firebaseService = new FirebaseService(); 