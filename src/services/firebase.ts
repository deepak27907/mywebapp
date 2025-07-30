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
import { User, Task, MoodEntry, JournalEntry, ChatMessage } from '../types';

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
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    // Firestore Timestamp
    return timestamp.toDate();
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
      } catch (error: any) {
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
        const docRef = await addDoc(collection(db, 'tasks'), task);
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
      for (const [userId, tasks] of mockData.tasks.entries()) {
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
      } catch (error: any) {
        console.error('Error getting mood entries from Firebase:', error);
        
        // Handle index building error specifically
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
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
        const docRef = await addDoc(collection(db, 'moodEntries'), entry);
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
        const docRef = await addDoc(collection(db, 'journalEntries'), entry);
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
      for (const [userId, entries] of mockData.journalEntries.entries()) {
        const entryIndex = entries.findIndex(entry => entry.id === entryId);
        if (entryIndex !== -1) {
          entries[entryIndex] = { ...entries[entryIndex], ...updates };
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

  async addChatMessage(message: Omit<ChatMessage, 'id'>): Promise<string> {
    if (this.isFirebaseAvailable()) {
      try {
        const docRef = await addDoc(collection(db, 'chatMessages'), message);
        return docRef.id;
      } catch (error) {
        console.error('Error adding chat message to Firebase:', error);
        throw error;
      }
    } else {
      // Fallback to mock data
      const messageId = Date.now().toString();
      const newMessage = { ...message, id: messageId };
      const userMessages = mockData.chatMessages.get(message.userId || '') || [];
      userMessages.push(newMessage);
      mockData.chatMessages.set(message.userId || '', userMessages);
      return messageId;
    }
  }
}

export const firebaseService = new FirebaseService(); 