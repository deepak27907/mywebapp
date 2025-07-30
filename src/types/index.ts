export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  dateOfBirth?: string;
  institute?: string;
  department?: string;
  year?: string;
  // New fields for Indian students
  targetExam?: 'NEET' | 'JEE';
  currentStatus?: 'Class 11' | 'Class 12' | 'Dropper';
  targetYear?: string;
  coachingInstitute?: string;
  preferredSubjects?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
  userId?: string;
  // New fields for academic tasks
  taskType?: 'academic' | 'personal';
  subject?: string;
  topic?: string;
  estimatedTime?: number; // in minutes
  completedAt?: Date;
}

export interface MoodEntry {
  id: string;
  mood: string;
  energy: number;
  stress: number;
  focus: number;
  date: Date;
  notes?: string;
  oneLiner?: string;
  userId?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  aiFeedback?: string;
  userId?: string;
  // New fields for better organization
  category?: 'study' | 'personal' | 'reflection' | 'goal';
  tags?: string[];
  isPrivate?: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  userId?: string;
}

// New interface for chat sessions
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  isActive: boolean;
}