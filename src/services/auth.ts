import { firebaseService } from './firebase';
import { studentAuthService } from './studentAuth';
import { User } from '../types';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  // Student authentication (using student ID + date of birth)
  async authenticateStudent(studentId: string, dateOfBirth: string): Promise<AuthResult> {
    try {
      const user = await studentAuthService.validateStudent(studentId, dateOfBirth);
      if (user) {
        // Try to store user in Firebase, but don't fail if Firebase is not available
        try {
          await firebaseService.createUser(user);
        } catch (firebaseError) {
          console.log('Firebase not available, using local storage');
        }
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid student ID or date of birth' };
      }
    } catch (error) {
      console.error('Student authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Register new student
  async registerStudent(studentData: Omit<User, 'id'>): Promise<AuthResult> {
    try {
      const user = await studentAuthService.registerStudent(studentData);
      // Try to store user in Firebase, but don't fail if Firebase is not available
      try {
        await firebaseService.createUser(user);
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage');
      }
      return { success: true, user };
    } catch (error) {
      console.error('Student registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Firebase email/password authentication
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const firebaseUser = await firebaseService.signInWithEmailAndPassword(email, password);
      
      // Get user data from Firestore
      const userData = await firebaseService.getUser(firebaseUser.uid);
      
      if (userData) {
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'User data not found' };
      }
    } catch (error) {
      console.error('Firebase sign in error:', error);
      return { success: false, error: 'Invalid email or password' };
    }
  }

  // Firebase registration
  async registerWithEmail(email: string, password: string, userData: Omit<User, 'id'>): Promise<AuthResult> {
    try {
      const firebaseUser = await firebaseService.createUserWithEmailAndPassword(email, password);
      
      // Create user with Firebase UID
      const user: User = {
        ...userData,
        id: firebaseUser.uid,
        email: email
      };
      
      await firebaseService.createUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Firebase registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const firebaseUser = firebaseService.getCurrentUser();
    if (firebaseUser) {
      // This would need to be enhanced to get user data from Firestore
      return null;
    }
    return null;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        firebaseService.getUser(firebaseUser.uid).then(userData => {
          callback(userData);
        });
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService(); 